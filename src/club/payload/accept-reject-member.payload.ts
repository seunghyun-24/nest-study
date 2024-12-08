import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum AcceptRejectDecision {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export class HandleApplicantPayload {
  @IsEnum(AcceptRejectDecision, {
    message: '승인 혹은 거절이어야 합니다.',
  })
  @ApiProperty({
    description: '클럽 멤버를 승인/거절 합니다.',
    enum: AcceptRejectDecision,
  })
  decision!: AcceptRejectDecision;
}
