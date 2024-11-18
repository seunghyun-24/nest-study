import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class EventOutPayload {
  @IsInt()
  @ApiProperty({
    description: '이벤트에 탈퇴할 user ID',
    type: Number,
  })
  userId!: number;
}
