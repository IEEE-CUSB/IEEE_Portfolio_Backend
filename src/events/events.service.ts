import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event } from './entities/event.entity';
import { EventRegistrationStatus } from './entities/event-registration.entity';
import { EventsRepository } from './events.repository';
import { EventRegistrationsRepository } from './event-registrations.repository';
import { User } from 'src/users/entities/user.entity';
import { RoleName } from 'src/roles/entities/role.entity';
import { ERROR_MESSAGES } from 'src/constants/swagger-messages';

/** Business rules for events: visibility, registration, capacity and waitlist. */
@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly registrationsRepository: EventRegistrationsRepository,
  ) {}

  // is_full / remainingSpots / is_registered / registration_id
  private async enrichEventWithDetails(event: Event, currentUser?: User) {
    const registeredCount = await this.registrationsRepository.countSpotHolding(
      event.id,
    );

    const remainingSpots = event.capacity - registeredCount;
    const is_full = remainingSpots <= 0;

    const enrichedEvent: any = {
      ...event,
      remainingSpots,
      is_full,
    };

    // Add user-specific registration info if authenticated
    if (currentUser) {
      const userRegistration =
        await this.registrationsRepository.findActiveForUser(
          event.id,
          currentUser.id,
        );

      enrichedEvent.is_registered = !!userRegistration;
      enrichedEvent.registration = userRegistration || null;
    }

    return enrichedEvent;
  }

  private async popOneWaitlistedToRegistered(eventId: string) {
    const waitlisted =
      await this.registrationsRepository.findOldestWaitlisted(eventId);

    if (waitlisted) {
      waitlisted.status = EventRegistrationStatus.REGISTERED;
      await this.registrationsRepository.save(waitlisted);

      // TODO: Send notification to user about registration update
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    currentUser?: User,
    search?: string,
    location?: string,
    category_id?: string,
    include_unpublished?: boolean,
  ) {
    // Only admins can see unpublished events
    const isAdmin =
      currentUser?.role?.name === RoleName.ADMIN ||
      currentUser?.role?.name === RoleName.SUPER_ADMIN;

    const [events, total] = await this.eventsRepository.findAllPaginated(
      page,
      limit,
      {
        search,
        location,
        category_id,
        publishedOnly: !(isAdmin && include_unpublished),
      },
    );

    // Enrich events with capacity and registration details
    const enrichedEvents = await Promise.all(
      events.map((event) => this.enrichEventWithDetails(event, currentUser)),
    );

    return {
      data: enrichedEvents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser?: User) {
    const event = await this.eventsRepository.findByIdWithRelations(id);

    if (!event) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT_NOT_FOUND);
    }

    if (currentUser) {
      return this.enrichEventWithDetails(event, currentUser);
    }

    return event;
  }

  async register(eventId: string, currentUser: User) {
    const event = await this.eventsRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT_NOT_FOUND);
    }

    if (new Date() > event.registration_deadline) {
      throw new BadRequestException(ERROR_MESSAGES.EVENT_REGISTRATION_CLOSED);
    }

    const existingRegistration =
      await this.registrationsRepository.findByEventAndUser(
        eventId,
        currentUser.id,
      );

    if (
      existingRegistration &&
      existingRegistration.status !== EventRegistrationStatus.CANCELLED
    ) {
      throw new ConflictException(ERROR_MESSAGES.EVENT_ALREADY_REGISTERED);
    }

    const registeredCount =
      await this.registrationsRepository.countSpotHolding(eventId);

    const remainingSpots = event.capacity - registeredCount;
    const status =
      remainingSpots <= 0
        ? EventRegistrationStatus.WAITLISTED
        : EventRegistrationStatus.REGISTERED;

    if (existingRegistration) {
      existingRegistration.status = status;
      return this.registrationsRepository.save(existingRegistration);
    }

    const registration = this.registrationsRepository.create({
      event_id: eventId,
      user_id: currentUser.id,
      status,
    });

    return this.registrationsRepository.save(registration);
  }

  async cancelRegistration(eventId: string, currentUser: User) {
    const registration = await this.registrationsRepository.findByEventAndUser(
      eventId,
      currentUser.id,
    );

    if (!registration) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT_REGISTRATION_NOT_FOUND);
    }

    if (registration.status !== EventRegistrationStatus.CANCELLED) {
      registration.status = EventRegistrationStatus.CANCELLED;
      await this.registrationsRepository.save(registration);

      // After cancellation, try to pop one waitlisted user to registered
      await this.popOneWaitlistedToRegistered(eventId);
    }

    return registration;
  }
}
