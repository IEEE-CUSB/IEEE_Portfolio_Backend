import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

export interface EventFilters {
  search?: string;
  location?: string;
  category_id?: string;
  /** When true, only published events are returned. */
  publishedOnly: boolean;
}

/** Data access for events: every query on the events table lives here. */
@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async findAllPaginated(
    page: number,
    limit: number,
    filters: EventFilters,
  ): Promise<[Event[], number]> {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.images', 'images')
      .leftJoinAndSelect('event.category', 'category');

    if (filters.publishedOnly) {
      query.where('event.is_published = :is_published', { is_published: true });
    }

    query
      .orderBy('event.start_time', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.search) {
      query.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.location) {
      query.andWhere('event.location ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    if (filters.category_id) {
      query.andWhere('event.category_id = :category_id', {
        category_id: filters.category_id,
      });
    }

    return query.getManyAndCount();
  }

  async findById(id: string): Promise<Event | null> {
    return this.eventsRepository.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: string): Promise<Event | null> {
    return this.eventsRepository.findOne({
      where: { id },
      relations: ['images', 'category'],
    });
  }
}
