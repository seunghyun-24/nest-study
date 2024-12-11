import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './review.repository';
import { EventRepository } from 'src/event/event.repository';
import { ClubRepository } from 'src/club/club.repository';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository, EventRepository, ClubRepository],
})
export class ReviewModule {}
