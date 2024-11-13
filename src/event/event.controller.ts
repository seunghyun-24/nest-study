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
} from '@nestjs/common';
import { EventDto } from './dto/event.dto';
import { CreateEventPayload } from './payload/create-event.payload';

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
}
