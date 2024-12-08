import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { ClubRepository } from './club.repository';

@Module({
  imports: [EventModule],
  controllers: [ClubController],
  providers: [ClubService, ClubRepository],
})
export class ClubModule {}
