import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { CreateClubPayload } from './payload/create-club.payload';
import { UpdateClubPayload } from './payload/update-club.payload';
import { CreateClubData } from './type/create-club-data.type';
import { UpdateClubData } from './type/update-club-data.type';
import { ClubDto, ClubListDto, ClubMemberDto } from './dto/club.dto';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { ClubJoinStatus } from '@prisma/client';

@Injectable()
export class ClubService {
  constructor(private readonly clubRepository: ClubRepository) {}

  async createClub(
    payload: CreateClubPayload,
    user: UserBaseInfo,
  ): Promise<ClubDto> {
    const createData: CreateClubData = {
      title: payload.title,
      description: payload.description,
      leaderId: user.id,
      maxPeople: payload.maxPeople,
      members: payload.members.map((member) => ({
        userId: member,
        status: ClubJoinStatus.MEMBER,
      })),
    };

    const club = await this.clubRepository.createClub(createData);

    return ClubDto.from(club);
  }

  async getClubById(clubId: number): Promise<ClubDto> {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('해당 클럽이 존재하지 않습니다.');
    }
    return ClubDto.from(club);
  }

  async getClubs(): Promise<ClubListDto> {
    const clubs = await this.clubRepository.getClubs();
    return ClubListDto.from(clubs);
  }

  // async getClubMembers(clubId: number): Promise<number[]> {
  //   const members = await this.clubRepository.getClubMembers(clubId);
  //   return members;
  // }

  // async getClubMembers(clubId: number): Promise<ClubMemberListDto> {
  //   const club = await this.clubRepository.getClubById(clubId);
  //   if (!club) {
  //     throw new NotFoundException('해당 클럽이 존재하지 않습니다.');
  //   }
  //   return ClubMemberListDto.from(club);
  // }

  async getClubMembersByStatus(
    clubId: number,
    status: ClubJoinStatus,
  ): Promise<ClubMemberDto[]> {
    const members = await this.clubRepository.getClubMembersByStatus(
      clubId,
      status,
    );
    return ClubMemberDto.fromArray(members);
  }

  async updateClub(
    clubId: number,
    payload: UpdateClubPayload,
    user: UserBaseInfo,
  ): Promise<ClubDto> {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('해당 클럽이 존재하지 않습니다.');
    }

    if (club.leaderId !== user.id) {
      throw new ConflictException('클럽 리더만 수정할 수 있습니다.');
    }

    if (payload.title === null) {
      throw new BadRequestException('클럽명은 null이 될 수 없습니다.');
    }
    if (payload.description === null) {
      throw new BadRequestException('클럽 설명은 null이 될 수 없습니다.');
    }
    if (payload.leaderId === null) {
      throw new BadRequestException('리더 ID는 null이 될 수 없습니다.');
    }
    if (payload.maxPeople === null) {
      throw new BadRequestException('최대 인원은 null이 될 수 없습니다.');
    }

    if (payload.leaderId) {
      const isClubMember = await this.clubRepository.getUserIsClubMember(
        clubId,
        payload.leaderId,
      );
      if (!isClubMember) {
        throw new BadRequestException(
          '클럽 멤버가 아닌 user는 리더가 될 수 없습니다.',
        );
      }
    }

    if (payload.maxPeople) {
      const clubCount = await this.clubRepository.getClubMembersCount(clubId);
      if (payload.maxPeople < clubCount) {
        throw new ConflictException(
          '최대 인원은 현재 클럽 인원보다 작을 수 없습니다.',
        );
      }
    }

    const updateData: UpdateClubData = {
      title: payload.title,
      description: payload.description,
      leaderId: payload.leaderId,
      maxPeople: payload.maxPeople,
    };

    const updatedClub = await this.clubRepository.updateClub(
      clubId,
      updateData,
    );

    return ClubDto.from(updatedClub);
  }

  async joinClub(clubId: number, user: UserBaseInfo): Promise<void> {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('클럽이 존재하지 않습니다.');
    }

    const userIsMember = await this.clubRepository.getUserIsClubMember(
      user.id,
      clubId,
    );
    if (userIsMember) {
      throw new ConflictException('이미 가입한 클럽입니다.');
    }

    const currentMemberCount =
      await this.clubRepository.getClubMembersCount(clubId);

    if (club.maxPeople == currentMemberCount) {
      throw new ConflictException('이미 정원이 다 찼습니다.');
    }

    await this.clubRepository.joinClub(user.id, clubId);
  }
}
