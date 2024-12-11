import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './review.repository';
import { EventRepository } from '../event/event.repository';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository, EventRepository],
})
export class ReviewModule {}
