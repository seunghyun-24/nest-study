import {
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
  ApiNoContentResponse,
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
  Patch,
} from '@nestjs/common';
import { EventDto, EventListDto } from './dto/event.dto';
import { CreateEventPayload } from './payload/create-event.payload';
import { EventJoinPayload } from './payload/event-join.payload';
import { EventOutPayload } from './payload/event-out.payload';
import { EventListQuery } from './query/event-list.query';
import { EventUpdatePayload } from './payload/event-update.payload';

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

  @Post(':eventID/join')
  @ApiOperation({ summary: 'user가 특정 모임에 참가합니다.' })
  @ApiNoContentResponse() // 204
  async joinEvent(
    @Param('eventID', ParseIntPipe) eventID: number,
    @Body() payload: EventJoinPayload,
  ): Promise<void> {
    return this.eventService.joinEvent(eventID, payload.userId);
      
  @Post(':eventID/out')
  @ApiOperation({ summary: 'user가 특정 모임에서 탈퇴합니다.' })
  @ApiNoContentResponse() // 204
  async outEvent(
    @Param('eventID', ParseIntPipe) eventID: number,
    @Body() payload: EventOutPayload,
  ): Promise<void> {
    return this.eventService.outEvent(eventID, payload.userId);
  }

  // @Patch(':eventID')
  // @ApiOperation({ summary: '특정 모임을 수정합니다.' })
  // @ApiOkResponse({ type: EventDto })
  // async updateEvent(
  //   @Param('eventID', ParseIntPipe) eventID: number,
  //   @Body() payload: EventUpdatePayload,
  // ): Promise<EventDto> {
  //   return this.eventService.updateEvent(eventID, payload);
  // }

}
