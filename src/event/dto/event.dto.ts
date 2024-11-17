import { ApiProperty } from '@nestjs/swagger';
import { EventData } from '../type/event-data.type';

export class EventDto {
  @ApiProperty({
    description: '이벤트 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '이벤트 이름',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '이벤트 설명',
    type: String,
  })
  description!: string;

  @ApiProperty({
    description: '호스트 ID',
    type: Number,
  })
  hostId!: number;

  @ApiProperty({
    description: '이벤트 카테고리 ID',
    type: Number,
  })
  categoryId!: number;

  @ApiProperty({
    description: '이벤트 도시 ID',
    type: Number,
  })
  cityId!: number;

  @ApiProperty({
    description: '이벤트 시작 시간',
    type: Date,
  })
  startTime!: Date;

  @ApiProperty({
    description: '이벤트 종료 시간',
    type: Date,
  })
  endTime!: Date;

  @ApiProperty({
    description: '이벤트에 참여가능한 최대 인원',
    type: Number,
  })
  maxPeople!: number;

  static from(event: EventData): EventDto {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      hostId: event.hostId,
      categoryId: event.categoryId,
      cityId: event.cityId,
      startTime: event.startTime,
      endTime: event.endTime,
      maxPeople: event.maxPeople,
    };
  }

  static fromArray(events: EventData[]): EventDto[] {
    return events.map((event) => this.from(event));
  }
}

export class EventListDto {
  @ApiProperty({
    description: '이벤트 목록',
    type: [EventDto],
  })
  events!: EventDto[];

  static from(events: EventData[]): EventListDto {
    return {
      events: EventDto.fromArray(events),
    };
  }
}
