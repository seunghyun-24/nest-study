import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventPayload } from './payload/create-event.payload';
import { CreateEventData } from './type/create-event-data.type';
import { UpdateEventData } from './type/update-event-data.type';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { EventDto, EventListDto } from './dto/event.dto';
import { EventRepository } from './event.repository';
import { EventListQuery } from './query/event-list.query';
import { EventUpdatePayload } from './payload/event-update.payload';

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
      throw new ConflictException(
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

    return EventDto.from(event);
  }

  async getEvent(eventId: number): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    }
    return EventDto.from(event);
  }

  async getEvents(query: EventListQuery): Promise<EventListDto> {
    const events = await this.eventRepository.getEvents(query);
    return EventListDto.from(events);
  }

  async joinEvent(eventId: number, userId: number): Promise<void> {
    const user = await this.eventRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('해당 user는 존재하지 않습니다.');
    }

    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    }

    if (event.startTime < new Date()) {
      throw new ConflictException(
        'Event는 이미 시작되었습니다. 시작한 Event에는 참여할 수 없습니다.',
      );
    }

    const joinedCheck = await this.eventRepository.isUserJoinedToEvent(
      eventId,
      userId,
    );
    if (joinedCheck) {
      throw new ConflictException('이미 참여한 Event입니다.');
    }

    const userCount = await this.eventRepository.getJoinedUserCount(eventId);
    if (event.maxPeople <= userCount) {
      throw new ConflictException('Event 참여인원이 꽉 찼습니다.');
    }

    await this.eventRepository.joinUserToEvent(eventId, userId);
  }

  async outEvent(eventId: number, userId: number): Promise<void> {
    const user = await this.eventRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('해당 user는 존재하지 않습니다.');
    }

    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    }

    if (event.startTime < new Date()) {
      throw new ConflictException(
        'Event는 이미 시작되었습니다. 들어올 땐 마음대로지만 나갈 땐 아니랍니다.',
      );
    }

    if (user.id == event.hostId) {
      throw new ConflictException('주최자는 탈퇴할 수 없습니다.');
    }

    const joinedCheck = await this.eventRepository.isUserJoinedToEvent(
      eventId,
      user.id,
    );
    if (!joinedCheck) {
      throw new ConflictException('참가하지 않은 Event입니다.');
    }

    await this.eventRepository.outUserFromEvent(eventId, userId);
  }

  async updateEvent(
    eventId: number,
    payload: EventUpdatePayload,
  ): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    }

    if (event.startTime < new Date()) {
      throw new ConflictException('이미 시작된 Event를 수정할 수 없습니다');
    }

    if (payload.startTime) {
      if (payload.startTime < new Date()) {
        throw new ConflictException(
          'Event는 현재시간 이후에 시작할 수 있습니다.',
        );
      }

      if (payload.startTime >= event.endTime) {
        throw new ConflictException('Event는 시작 후에 종료될 수 있습니다.');
      }
    }

    if (payload.endTime) {
      if (payload.endTime < new Date()) {
        throw new ConflictException(
          'Event는 현재시간 이후에 종료될 수 있습니다.',
        );
      }

      if (event.startTime >= payload.endTime) {
        throw new ConflictException('Event는 시작 후에 종료될 수 있습니다.');
      }
    }

    if (payload.maxPeople) {
      const numJoinedUsers =
        await this.eventRepository.getJoinedUserCount(eventId);
      if (payload.maxPeople < numJoinedUsers) {
        throw new ConflictException('참가자 수가 최대 인원보다 많습니다.');
      }
    }

    if (payload.categoryId) {
      const isCategoryExist = await this.eventRepository.isCategoryExist(
        payload.categoryId,
      );
      if (!isCategoryExist) {
        throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
      }
    }

    if (payload.cityId) {
      const isCityExist = await this.eventRepository.isCityExist(
        payload.cityId,
      );
      if (!isCityExist) {
        throw new NotFoundException('해당 도시가 존재하지 않습니다.');
      }
    }

    const updateData: UpdateEventData = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityId: payload.cityId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const updatedEvent = await this.eventRepository.updateEvent(
      eventId,
      updateData,
    );

    return EventDto.from(updatedEvent);
  }

  async deleteEvent(eventId: number, user: UserBaseInfo): Promise<void> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    }

    if (event.startTime < new Date()) {
      throw new ConflictException('이미 시작된 Event를 삭제할 수 없습니다.');
    }

    if (event.hostId != user.id) {
      throw new ConflictException('주최자만 Event를 삭제할 수 있습니다.');
    }

    await this.eventRepository.deleteEvent(eventId);
  }
}
