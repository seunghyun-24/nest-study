import { ApiProperty } from '@nestjs/swagger';
import { ClubData } from '../type/club-data.type';
import { ClubMemberDto } from './club-member.dto';

export class ClubDto {
  @ApiProperty({
    description: '클럽 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '클럽 이름',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '클럽 설명',
    type: String,
  })
  description!: string;

  @ApiProperty({
    description: '클럽 리더 ID',
    type: Number,
  })
  leaderId!: number;

  @ApiProperty({
    description: '클럽에 참여가능한 최대 인원',
    type: Number,
  })
  maxPeople!: number;

  @ApiProperty({
    description: '클럽 멤버 정보',
    type: Object,
  })
  members!: { members: ClubMemberDto[] };

  static from(club: ClubData): ClubDto {
    return {
      id: club.id,
      title: club.title,
      description: club.description,
      leaderId: club.leaderId,
      maxPeople: club.maxPeople,
      members: { members: ClubMemberDto.fromArray(club.members) },
    };
  }

  static fromMemberIds(club: ClubData): number[] {
    return club.members.map((member) => member.userId);
  }

  static fromArray(clubs: ClubData[]): ClubDto[] {
    return clubs.map((club) => this.from(club));
  }
}

export class ClubListDto {
  @ApiProperty({
    description: '클럽 목록',
    type: [ClubDto],
  })
  clubs!: ClubDto[];

  static from(clubs: ClubData[]): ClubListDto {
    return {
      clubs: ClubDto.fromArray(clubs),
    };
  }
}
