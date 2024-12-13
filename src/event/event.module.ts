import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { ClubRepository } from '../club/club.repository';

@Module({
  controllers: [EventController],
  providers: [EventService, EventRepository, ClubRepository],
  exports: [EventService],
})
export class EventModule {}
