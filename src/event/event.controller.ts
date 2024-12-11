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
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EventDto, EventListDto, ClubEventListDto } from './dto/event.dto';
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

  @Get(':eventId')
  @ApiOperation({ summary: '특정 모임을 조회합니다.' })
  @ApiOkResponse({ type: EventDto })
  async getEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<EventDto> {
    return this.eventService.getEvent(eventId);
  }

  @Get()
  @ApiOperation({ summary: '조건에 따른 모임 목록을 조회합니다.' })
  @ApiOkResponse({ type: EventListDto })
  async getEvents(@Query() query: EventListQuery): Promise<EventListDto> {
    return this.eventService.getEvents(query);
  }

  @Post(':eventId/join')
  @ApiOperation({ summary: 'user가 특정 모임에 참가합니다.' })
  @ApiNoContentResponse() // 204
  @HttpCode(204)
  async joinEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() payload: EventJoinPayload,
  ): Promise<void> {
    return this.eventService.joinEvent(eventId, payload.userId);
  }

  @Post(':eventId/out')
  @ApiOperation({ summary: 'user가 특정 모임에서 탈퇴합니다.' })
  @ApiNoContentResponse() // 204
  @HttpCode(204)
  async outEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() payload: EventOutPayload,
  ): Promise<void> {
    return this.eventService.outEvent(eventId, payload.userId);
  }

  @Patch(':eventId')
  @ApiOperation({ summary: '특정 모임을 수정합니다.' })
  @ApiOkResponse({ type: EventDto })
  async updateEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() payload: EventUpdatePayload,
  ): Promise<EventDto> {
    return this.eventService.updateEvent(eventId, payload);
  }

  @Delete(':eventId')
  @HttpCode(204)
  @ApiOperation({ summary: '모임을 삭제합니다.' })
  @ApiNoContentResponse()
  async deleteEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<void> {
    return this.eventService.deleteEvent(eventId);
  }

  // @Get('clubs/:clubId/events')
  // @ApiOperation({ summary: '클럽 전용 이벤트 목록 조회' })
  // @ApiOkResponse({ type: ClubEventListDto })
  // async getClubEvents(
  //   @Param('clubId', ParseIntPipe) clubId: number,
  // ): Promise<ClubEventListDto> {
  //   return this.eventService.getClubEvents(clubId);
  // }
}
