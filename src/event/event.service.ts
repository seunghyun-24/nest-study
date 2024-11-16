import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventPayload } from './payload/create-event.payload';
import { CreateEventData } from './type/create-event-data.type';
import { EventDto, EventListDto } from './dto/event.dto';
import { EventRepository } from './event.repository';
import { EventListQuery } from './query/event-list.query';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(payload: CreateEventPayload): Promise<EventDto> {
    const isCategoryExist = await this.eventRepository.isCategoryExist(
      payload.categoryId,
    );
    if (!isCategoryExist) {
      throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
    }

    const isCityExist = await this.eventRepository.isCityExist(payload.cityId);
    if (!isCityExist) {
      throw new NotFoundException('해당 도시가 존재하지 않습니다.');
    }

    if (payload.startTime < new Date()) {
      throw new BadRequestException(
        'Event는 현재시간 이후에 시작할 수 있습니다.',
      );
    }

    if (payload.startTime >= payload.endTime) {
      throw new BadRequestException('Event는 시작 후에 종료될 수 있습니다.');
    }

    const user = await this.eventRepository.getUserById(payload.hostId);
    if (!user) {
      throw new NotFoundException('주최자가 존재하지 않습니다.');
    }

    const createData: CreateEventData = {
      hostId: payload.hostId,
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityId: payload.cityId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const event = await this.eventRepository.createEvent(createData);
    await this.eventRepository.joinUserToEvent({
      eventID: event.id,
      userID: event.hostId,
    });

    return EventDto.from(event);
  }

  async getEvent(eventID: number): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventID);
    if (!event) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    }
    return EventDto.from(event);
  }

  async getEvents(query: EventListQuery): Promise<EventListDto> {
    const events = await this.eventRepository.getEvents(query);
    return EventListDto.from(events);
  }

  async joinEvent(eventID: number, userID: number): Promise<void> {
    const user = await this.eventRepository.getUserById(userID);
    if (!user) {
      throw new NotFoundException('해당 user는 존재하지 않습니다.');
    }

    const { exists, isFull, startTime } =
      await this.eventRepository.checkEventStatus(eventID);

    if (!exists) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    } else if (isFull) {
      throw new BadRequestException('Event가 꽉 찼습니다.');
    } else {
      if (await this.eventRepository.isUserJoinedToEvent({ eventID, userID })) {
        throw new BadRequestException('이미 참가한 Event입니다.');
      } else if (startTime < new Date()) {
        throw new BadRequestException(
          'Event가 이미 시작되어 참여할 수 없습니다.',
        );
      } else {
        await this.eventRepository.joinUserToEvent({ eventID, userID });
      }
    }
  }

  async outEvent(eventID: number, userID: number): Promise<void> {
    const user = await this.eventRepository.getUserById(userID);
    if (!user) {
      throw new NotFoundException('해당 user는 존재하지 않습니다.');
    }

    const { exists, _, startTime } =
      await this.eventRepository.checkEventStatus(eventID);

    if (!exists) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    } else if (startTime < new Date()) {
      throw new BadRequestException(
        'Event가 이미 시작되어 탈퇴할 수 없습니다.',
      );
    } else {
      if (
        !(await this.eventRepository.isUserJoinedToEvent({ eventID, userID }))
      ) {
        throw new BadRequestException('참가하지 않은 Event입니다.');
      } else if (
        userID === (await this.eventRepository.getEventHostId(eventID))
      ) {
        throw new ConflictException('주최자는 탈퇴할 수 없습니다.');
      }

      await this.eventRepository.outUserFromEvent({ eventID, userID });
    }
  }
}
