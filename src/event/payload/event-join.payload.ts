import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class EventJoinPayload {
  @IsInt()
  @ApiProperty({
    description: '이벤트에 참여할 user ID',
    type: Number,
  })
  userId!: number;
}
