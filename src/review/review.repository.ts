import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateReviewData } from './type/create-review-data.type';
import { ReviewData } from './type/review-data.type';
import { User, Event } from '@prisma/client';
import { ReviewQuery } from './query/review.query';
import { UpdateReviewData } from './type/update-review-data.type';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(data: CreateReviewData): Promise<ReviewData> {
    return this.prisma.review.create({
      data: {
        userId: data.userId,
        eventId: data.eventId,
        score: data.score,
        title: data.title,
        description: data.description,
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }

  async getEventById(eventId: number): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
  }

  async isReviewExist(userId: number, eventId: number): Promise<boolean> {
    const review = await this.prisma.review.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
        user: {
          deletedAt: null,
        },
      },
    });

    return !!review;
  }

  async isUserJoinedEvent(userId: number, eventId: number): Promise<boolean> {
    const event = await this.prisma.eventJoin.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
        user: {
          deletedAt: null,
        },
      },
    });

    return !!event;
  }

  async isUserJoinedClub(userId: number, clubId: number): Promise<boolean> {
    const clubExist = await this.prisma.clubJoin.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
        user: {
          deletedAt: null,
        },
      },
    });

    return !!clubExist;
  }

  async getReviewById(reviewId: number): Promise<ReviewData | null> {
    return this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async getReviews(query: ReviewQuery): Promise<ReviewData[]> {
    return this.prisma.review.findMany({
      where: {
        eventId: query.eventId,
        user: {
          deletedAt: null,
          id: query.userId,
        },
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async updateReview(
    reviewId: number,
    data: UpdateReviewData,
  ): Promise<ReviewData> {
    return this.prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        score: data.score,
        title: data.title,
        description: data.description,
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async deleteReview(reviewId: number): Promise<void> {
    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
  }
}
