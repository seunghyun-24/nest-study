import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { CreateEventData } from './type/create-event-data.type';
import { UpdateEventData } from './type/update-event-data.type';
import { EventData } from './type/event-data.type';
import { EventListQuery } from './query/event-list.query';
// import { EventUpdatePayload } from './payload/event-update.payload';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: CreateEventData): Promise<EventData> {
    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        hostId: data.hostId,
        categoryId: data.categoryId,
        clubId: data.clubId,
        eventCity: {
          create: data.cityIds.map((cityId) => ({
            cityId: cityId,
          })),
        },
        startTime: data.startTime,
        endTime: data.endTime,
        maxPeople: data.maxPeople,
        eventJoin: {
          create: {
            userId: data.hostId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        hostId: true,
        clubId: true,
        categoryId: true,
        eventCity: {
          select: {
            cityId: true,
          },
        },
        startTime: true,
        endTime: true,
        maxPeople: true,
        eventJoin: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        // deletedAt: null,
      },
    });
  }

  async isCategoryExist(categoryId: number): Promise<boolean> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
    return !!category;
  }

  async areCitysExist(cityIds: number | number[]): Promise<boolean> {
    const ids = Array.isArray(cityIds) ? cityIds : [cityIds];
    const cities = await this.prisma.city.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return cities.length === ids.length;
  }

  async getEventById(eventId: number): Promise<EventData | null> {
    return this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        hostId: true,
        clubId: true,
        categoryId: true,
        eventCity: {
          select: {
            cityId: true,
          },
        },
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }

  async getEvents(query: EventListQuery): Promise<EventData[]> {
    return await this.prisma.event.findMany({
      where: {
        categoryId: query.categoryId,
        eventCity: {
          some: {
            cityId: query.cityId,
          },
        },
        hostId: query.hostId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        hostId: true,
        clubId: true,
        categoryId: true,
        eventCity: {
          select: {
            cityId: true,
          },
        },
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }

  // async getClubEvents(clubId: number): Promise<EventData[]> {
  //   return this.prisma.event.findMany({
  //     where: {
  //       clubId: clubId,
  //     },
  //     select: {
  //       id: true,
  //       title: true,
  //       description: true,
  //       hostId: true,
  //       categoryId: true,
  //       eventCity: {
  //         select: {
  //           cityId: true,
  //         },
  //       },
  //       startTime: true,
  //       endTime: true,
  //       maxPeople: true,
  //     },
  //   });
  // }

  async joinUserToEvent(eventId: number, userId: number): Promise<void> {
    await this.prisma.eventJoin.create({
      data: {
        eventId: eventId,
        userId: userId,
      },
    });
  }

  async isUserJoinedToEvent(eventId: number, userId: number): Promise<boolean> {
    const eventJoin = await this.prisma.eventJoin.findFirst({
      where: {
        eventId,
        userId,
      },
    });
    return !!eventJoin;
  }

  async getJoinedUserCount(eventId: number): Promise<number> {
    const joinCount = await this.prisma.eventJoin.count({
      where: {
        eventId: eventId,
      },
    });

    return joinCount;
  }

  async outUserFromEvent(eventId: number, userId: number): Promise<void> {
    await this.prisma.eventJoin.delete({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: userId,
        },
      },
    });
  }

  async updateEvent(
    eventId: number,
    updatedData: UpdateEventData,
  ): Promise<EventData> {
    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: updatedData,
      select: {
        id: true,
        title: true,
        description: true,
        hostId: true,
        clubId: true,
        categoryId: true,
        eventCity: {
          select: {
            cityId: true,
          },
        },
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }

  async deleteEvent(eventId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.eventJoin.deleteMany({
        where: {
          eventId: eventId,
        },
      }),
      this.prisma.event.delete({
        where: {
          id: eventId,
        },
      }),
    ]);
  }

  // async getEventJoinUsers(eventId: number): Promise<User[]> {
  //   return this.prisma.eventJoin
  //     .findMany({
  //       where: {
  //         eventId: eventId,
  //       },
  //       select: {
  //         userId: true,
  //       },
  //     })
  //     .then((eventJoins) => {
  //       const userIds = eventJoins.map((eventJoin) => eventJoin.userId);
  //       return this.prisma.user.findMany({
  //         where: {
  //           id: {
  //             in: userIds,
  //           },
  //         },
  //       });
  //     });
  // }
}
