import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ClubJoinStatus } from '@prisma/client';

export class ClubJoinStatusQuery {
  @IsEnum(ClubJoinStatus, {
    message: 'status는 ClubJoinStatus Enum 값 중 하나여야 합니다.',
  })
  @ApiProperty({
    description: '클럽 멤버 상태 (예: APPLICANT, MEMBER, REJECTED)',
    enum: ClubJoinStatus,
  })
  status!: ClubJoinStatus;
}
