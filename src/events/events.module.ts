import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { EventRegistrationsRepository } from './event-registrations.repository';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventImage } from './entities/event-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventRegistration, EventImage])],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, EventRegistrationsRepository],
  exports: [EventsService, EventsRepository, EventRegistrationsRepository],
})
export class EventsModule {}
