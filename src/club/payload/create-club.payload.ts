import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsString, Min } from 'class-validator';

export class CreateClubPayload {
  @IsString()
  @ApiProperty({
    description: '클럽 이름',
    type: String,
  })
  title!: string;

  @IsString()
  @ApiProperty({
    description: '클럽 설명',
    type: String,
  })
  description!: string;

  @IsInt()
  @ApiProperty({
    description: '클럽 리더 ID',
    type: Number,
  })
  leaderId!: number;

  @Min(1)
  @IsInt()
  @ApiProperty({
    description: '클럽에 참여가능한 최대 인원',
    type: Number,
  })
  maxPeople!: number;

  @Min(1)
  @IsArray()
  @ApiProperty({
    description: '클럽 멤버원 ID 명단',
    type: [Number],
  })
  memberIds!: number[];
}
