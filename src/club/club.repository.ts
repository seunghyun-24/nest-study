import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateClubData } from './type/create-club-data.type';
import { ClubData } from './type/club-data.type';
import { ClubJoinStatus } from '@prisma/client';
import { UpdateClubData } from './type/update-club-data.type';

@Injectable()
export class ClubRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createClub(data: CreateClubData): Promise<ClubData> {
    const club = await this.prisma.club.create({
      data: {
        title: data.title,
        description: data.description,
        leaderId: data.leaderId,
        maxPeople: data.maxPeople,
        clubJoin: {
          create: data.members.map((member) => ({
            userId: member.userId,
            status: member.status,
          })),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        leaderId: true,
        maxPeople: true,
        clubJoin: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    });
    return {
      id: club.id,
      title: club.title,
      description: club.description,
      leaderId: club.leaderId,
      maxPeople: club.maxPeople,
      members: club.clubJoin.map((join) => ({
        userId: join.userId,
        status: join.status,
      })),
    };
  }

  async validateUsersExist(userIds: number | number[]): Promise<boolean> {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return users.length === ids.length;
  }

  async getUserIsClubMember(userId: number, clubId: number): Promise<boolean> {
    const isClubMember = await this.prisma.clubJoin.findFirst({
      where: {
        userId,
        clubId,
        status: ClubJoinStatus.MEMBER,
        user: {
          deletedAt: null,
        },
      },
    });
    return !!isClubMember;
  }

  async getClubById(clubId: number): Promise<ClubData | null> {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        title: true,
        description: true,
        leaderId: true,
        maxPeople: true,
        clubJoin: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    });
    if (!club) return null;
    return {
      id: club.id,
      title: club.title,
      description: club.description,
      leaderId: club.leaderId,
      maxPeople: club.maxPeople,
      members: club.clubJoin.map((join) => ({
        userId: join.userId,
        status: join.status,
      })),
    };
  }

  async getClubs(): Promise<ClubData[]> {
    const clubs = await this.prisma.club.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        leaderId: true,
        maxPeople: true,
        clubJoin: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    });

    return clubs.map((club) => ({
      id: club.id,
      title: club.title,
      description: club.description,
      leaderId: club.leaderId,
      maxPeople: club.maxPeople,
      members: club.clubJoin.map((join) => ({
        userId: join.userId,
        status: join.status,
      })),
    }));
  }

  // async getClubMembers(clubId: number): Promise<number[]> {
  //   const members = await this.prisma.clubJoin.findMany({
  //     where: {
  //       clubId,
  //       status: ClubJoinStatus.MEMBER,
  //       user: {
  //         deletedAt: null,
  //       },
  //     },
  //     select: {
  //       userId: true,
  //     },
  //   });
  //   return members.map((member) => member.userId);
  // }

  async getClubMembersByStatus(
    clubId: number,
    status: ClubJoinStatus,
  ): Promise<{ userId: number; status: ClubJoinStatus }[]> {
    const members = await this.prisma.clubJoin.findMany({
      where: {
        clubId,
        status,
        user: {
          deletedAt: null,
        },
      },
      select: {
        userId: true,
        status: true,
      },
    });
    return members.map((member) => ({
      userId: member.userId,
      status: member.status,
    }));
  }

  async getClubMembersCount(clubId: number): Promise<number> {
    return this.prisma.clubJoin.count({
      where: {
        clubId,
        status: ClubJoinStatus.MEMBER,
        user: {
          deletedAt: null,
        },
      },
    });
  }

  async updateClub(clubId: number, data: UpdateClubData): Promise<ClubData> {
    const updatedClub = await this.prisma.club.update({
      where: { id: clubId },
      data: {
        title: data.title,
        description: data.description,
        leaderId: data.leaderId,
        maxPeople: data.maxPeople,
      },
      select: {
        id: true,
        title: true,
        description: true,
        leaderId: true,
        maxPeople: true,
        clubJoin: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    });
    return {
      id: updatedClub.id,
      title: updatedClub.title,
      description: updatedClub.description,
      leaderId: updatedClub.leaderId,
      maxPeople: updatedClub.maxPeople,
      members: updatedClub.clubJoin.map((join) => ({
        userId: join.userId,
        status: join.status,
      })),
    };
  }

  async outClub(clubId: number, userId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.eventJoin.deleteMany({
        where: {
          OR: [
            {
              event: {
                hostId: userId,
                startTime: {
                  gt: new Date(),
                },
              },
            },
            {
              userId,
              event: {
                startTime: {
                  gt: new Date(),
                },
              },
            },
          ],
        },
      }),

      this.prisma.eventCity.deleteMany({
        where: {
          event: {
            hostId: userId,
            startTime: {
              gt: new Date(),
            },
          },
        },
      }),
      this.prisma.event.deleteMany({
        where: {
          hostId: userId,
          startTime: {
            gt: new Date(),
          },
        },
      }),

      this.prisma.clubJoin.delete({
        where: {
          clubId_userId: {
            clubId,
            userId,
          },
        },
      }),
    ]);
  }
}
