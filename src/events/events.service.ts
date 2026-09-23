import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, SelectQueryBuilder } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventImage } from './entities/event-image.entity';
import {
  EventRegistration,
  EventRegistrationStatus,
} from './entities/event-registration.entity';
import { User } from 'src/users/entities/user.entity';
import { RoleName } from 'src/roles/entities/role.entity';
import { ERROR_MESSAGES } from 'src/constants/swagger-messages';
import { MediaService } from 'src/media/media.service';
import { resolveMediaFolder } from 'src/media/media.utils';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventImage)
    private readonly eventImagesRepository: Repository<EventImage>,
    @InjectRepository(EventRegistration)
    private readonly registrationsRepository: Repository<EventRegistration>,
    private readonly mediaService: MediaService,
  ) {}

  // is_full / remainingSpots / is_registered / registration_id
  private async enrichEventWithDetails(event: Event, currentUser?: User) {
    const registeredCount = await this.registrationsRepository.count({
      where: {
        event_id: event.id,
        status: In([
          EventRegistrationStatus.REGISTERED,
          EventRegistrationStatus.ATTENDED,
        ]),
      },
    });

    const remainingSpots = event.capacity - registeredCount;
    const is_full = remainingSpots <= 0;

    const enrichedEvent: any = {
      ...event,
      remainingSpots,
      is_full,
    };

    // Add user-specific registration info if authenticated
    if (currentUser) {
      const userRegistration = await this.registrationsRepository.findOne({
        where: {
          event_id: event.id,
          user_id: currentUser.id,
          status: In([
            EventRegistrationStatus.REGISTERED,
            EventRegistrationStatus.ATTENDED,
            EventRegistrationStatus.WAITLISTED,
          ]),
        },
      });

      enrichedEvent.is_registered = !!userRegistration;
      enrichedEvent.registration = userRegistration || null;
    }

    return enrichedEvent;
  }

  private async popOneWaitlistedToRegistered(eventId: string) {
    const [waitlisted] = await this.registrationsRepository.find({
      where: {
        event_id: eventId,
        status: EventRegistrationStatus.WAITLISTED,
      },
      order: { created_at: 'ASC' },
      take: 1,
    });

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
    const skip = (page - 1) * limit;

    const query = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.images', 'images')
      .leftJoinAndSelect('event.category', 'category');

    // Only admins can see unpublished events
    const isAdmin = currentUser?.role?.name === RoleName.ADMIN || currentUser?.role?.name === RoleName.SUPER_ADMIN;
    if (!(isAdmin && include_unpublished)) {
      query.where('event.is_published = :is_published', { is_published: true });
    }

    query.orderBy('event.start_time', 'ASC')
      .skip(skip)
      .take(limit);

    if (search) {
      query.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (location) {
      query.andWhere('event.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    if (category_id) {
      query.andWhere('event.category_id = :category_id', { category_id });
    }

    const [events, total] = await query.getManyAndCount();

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
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['images', 'category'],
    });

    if (!event) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT_NOT_FOUND);
    }

    if (currentUser) {
      return this.enrichEventWithDetails(event, currentUser);
    }

    return event;
  }

  async register(eventId: string, currentUser: User) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT_NOT_FOUND);
    }

    if (new Date() > event.registration_deadline) {
      throw new BadRequestException(ERROR_MESSAGES.EVENT_REGISTRATION_CLOSED);
    }

    const existingRegistration = await this.registrationsRepository.findOne({
      where: { event_id: eventId, user_id: currentUser.id },
    });

    if (
      existingRegistration &&
      existingRegistration.status !== EventRegistrationStatus.CANCELLED
    ) {
      throw new ConflictException(ERROR_MESSAGES.EVENT_ALREADY_REGISTERED);
    }

    const registeredCount = await this.registrationsRepository.count({
      where: {
        event_id: eventId,
        status: In([
          EventRegistrationStatus.REGISTERED,
          EventRegistrationStatus.ATTENDED,
        ]),
      },
    });

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
    const registration = await this.registrationsRepository.findOne({
      where: { event_id: eventId, user_id: currentUser.id },
    });

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
