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

<<<<<<< HEAD
  // async updateEvent(
  //   eventId: number,
  //   payload: EventUpdatePayload,
  // ): Promise<EventDto> {
  //   const event = await this.eventRepository.getEventById(eventId);
  //   if (!event) {
  //     throw new NotFoundException('해당 Event가 존재하지 않습니다.');
  //   }
=======
  async updateEvent(
    eventID: number,
    payload: EventUpdatePayload,
  ): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventID);
    if (!event) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    }
>>>>>>> 80c0cbc (모임을 수정하는 API)

    if (event.startTime < new Date()) {
      throw new BadRequestException(
        'Event는 현재시간 이후에 시작할 수 있습니다.',
      );
    }

    if (event.startTime >= event.endTime) {
      throw new BadRequestException('Event는 시작 후에 종료될 수 있습니다.');
    }

<<<<<<< HEAD
  //   if (payload.maxPeople) {
  //     const numJoinedUsers =
  //       await this.eventRepository.getJoinedUserCount(eventId);
  //     if (payload.maxPeople < numJoinedUsers) {
  //       throw new ConflictException('참가자 수가 최대 인원보다 많습니다.');
  //     }
  //   }
=======
    if (payload.maxPeople) {
      const numJoinedUsers =
        await this.eventRepository.getJoinedUserCount(eventID);
      if (payload.maxPeople < numJoinedUsers) {
        throw new ConflictException('참가자 수가 최대 인원보다 많습니다.');
      }
    }
>>>>>>> 80c0cbc (모임을 수정하는 API)

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

    const updatedEvent = await this.eventRepository.updateEvent(
      eventID,
      payload,
    );

<<<<<<< HEAD
  //   const updatedEvent = await this.eventRepository.updateEvent(
  //     eventId,
  //     payload,
  //   );

  //   return EventDto.from(updatedEvent);
  // }
=======
    return EventDto.from(updatedEvent);
  }
>>>>>>> 80c0cbc (모임을 수정하는 API)
}
