import { ApiProperty } from '@nestjs/swagger';
import { ClubJoinStatus } from '@prisma/client';

export class ClubMemberDto {
  @ApiProperty({
    description: '멤버 ID',
    type: Number,
  })
  userId!: number;

  @ApiProperty({
    description: '멤버 상태 (예: MEMBER, APPLICANT)',
    enum: ClubJoinStatus,
  })
  status!: ClubJoinStatus;

  static from(member: {
    userId: number;
    status: ClubJoinStatus;
  }): ClubMemberDto {
    return {
      userId: member.userId,
      status: member.status,
    };
  }

  static fromArray(
    members: { userId: number; status: ClubJoinStatus }[],
  ): ClubMemberDto[] {
    return members.map((member) => this.from(member));
  }
}

export class ClubMemberListDto {
  @ApiProperty({
    description: '클럽 멤버 정보 리스트',
    type: [ClubMemberDto],
  })
  members!: ClubMemberDto[];

  static from(members: ClubMemberDto[]): ClubMemberListDto {
    return {
      members,
    };
  }
}
