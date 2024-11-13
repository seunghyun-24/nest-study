import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsString, Min } from 'class-validator';

export class CreateEventPayload {
  @IsString()
  @ApiProperty({
    description: '이벤트 이름',
    type: String,
  })
  title!: string;

  @IsString()
  @ApiProperty({
    description: '이벤트 설명',
    type: String,
  })
  description!: string;

  @IsInt()
  @ApiProperty({
    description: '호스트 ID',
    type: Number,
  })
  hostId!: number;

  @IsInt()
  @ApiProperty({
    description: '이벤트 카테고리 ID',
    type: Number,
  })
  categoryId!: number;

  @IsInt()
  @ApiProperty({
    description: '이벤트 도시 ID',
    type: Number,
  })
  cityId!: number;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    description: '이벤트 시작 시간',
    type: Date,
  })
  startTime!: Date;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    description: '이벤트 종료 시간',
    type: Date,
  })
  endTime!: Date;

  @Min(1)
  @IsInt()
  @ApiProperty({
    description: '이벤트에 참여가능한 최대 인원',
    type: Number,
  })
  maxPeople!: number;
}
