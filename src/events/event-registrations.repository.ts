import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  EventRegistration,
  EventRegistrationStatus,
} from './entities/event-registration.entity';

/** Statuses that take up one of the event's capacity spots. */
const SPOT_HOLDING_STATUSES = [
  EventRegistrationStatus.REGISTERED,
  EventRegistrationStatus.ATTENDED,
];

/** Statuses that mean the user is still signed up (including the waitlist). */
const ACTIVE_STATUSES = [
  ...SPOT_HOLDING_STATUSES,
  EventRegistrationStatus.WAITLISTED,
];

@Injectable()
export class EventRegistrationsRepository {
  constructor(
    @InjectRepository(EventRegistration)
    private readonly registrationsRepository: Repository<EventRegistration>,
  ) {}

  /** Number of registrations currently holding a spot (registered or attended). */
  async countSpotHolding(eventId: string): Promise<number> {
    return this.registrationsRepository.count({
      where: { event_id: eventId, status: In(SPOT_HOLDING_STATUSES) },
    });
  }

  /** The user's non-cancelled registration for the event, if any. */
  async findActiveForUser(
    eventId: string,
    userId: string,
  ): Promise<EventRegistration | null> {
    return this.registrationsRepository.findOne({
      where: {
        event_id: eventId,
        user_id: userId,
        status: In(ACTIVE_STATUSES),
      },
    });
  }

  /** The user's registration for the event in any status (including cancelled). */
  async findByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<EventRegistration | null> {
    return this.registrationsRepository.findOne({
      where: { event_id: eventId, user_id: userId },
    });
  }

  /** The longest-waiting waitlisted registration for the event. */
  async findOldestWaitlisted(
    eventId: string,
  ): Promise<EventRegistration | null> {
    return this.registrationsRepository.findOne({
      where: { event_id: eventId, status: EventRegistrationStatus.WAITLISTED },
      order: { created_at: 'ASC' },
    });
  }

  create(data: Partial<EventRegistration>): EventRegistration {
    return this.registrationsRepository.create(data);
  }

  async save(registration: EventRegistration): Promise<EventRegistration> {
    return this.registrationsRepository.save(registration);
  }
}
