import {
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EventDto, EventListDto } from './dto/event.dto';
import { CreateEventPayload } from './payload/create-event.payload';
import { EventListQuery } from './query/event-list.query';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: '새로운 모임을 생성합니다.' })
  @ApiCreatedResponse({ type: EventDto })
  async createReview(@Body() payload: CreateEventPayload): Promise<EventDto> {
    return this.eventService.createEvent(payload);
  }

  @Get(':eventID')
  @ApiOperation({ summary: '특정 모임을 조회합니다.' })
  @ApiOkResponse({ type: EventDto })
  async getEvent(
    @Param('eventID', ParseIntPipe) eventID: number,
  ): Promise<EventDto> {
    return this.eventService.getEvent(eventID);
  }

  @Get()
  @ApiOperation({ summary: '조건에 따른 모임 목록을 조회합니다.' })
  @ApiOkResponse({ type: EventListDto })
  async getEvents(@Query() query: EventListQuery): Promise<EventListDto> {
    console.log(query);
    return this.eventService.getEvents(query);
  }
}
