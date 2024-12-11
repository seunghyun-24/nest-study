import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventPayload } from './payload/create-event.payload';
import { CreateEventData } from './type/create-event-data.type';
import { UpdateEventData } from './type/update-event-data.type';
import { EventDto, EventListDto } from './dto/event.dto';
import { EventRepository } from './event.repository';
import { ClubRepository } from '../club/club.repository';
import { EventListQuery } from './query/event-list.query';
import { EventUpdatePayload } from './payload/event-update.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { EventData } from './type/event-data.type';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly clubRepository: ClubRepository,
  ) {}

  async createEvent(payload: CreateEventPayload): Promise<EventDto> {
    const isCategoryExist = await this.eventRepository.isCategoryExist(
      payload.categoryId,
    );
    if (!isCategoryExist) {
      throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
    }

    const areCitysExist = await this.eventRepository.areCitysExist(
      payload.cityIds,
    );
    if (!areCitysExist) {
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

    if (payload.clubId) {
      const club = await this.clubRepository.getClubById(payload.clubId);
      if (!club) {
        throw new NotFoundException('해당 Club이 존재하지 않습니다.');
      }

      const isClubMember = await this.clubRepository.getUserIsClubMember(
        payload.hostId,
        payload.clubId,
      );
      if (!isClubMember) {
        throw new ConflictException(
          '클럽 멤버만 클럽 전용 이벤트를 만들 수 있습니다.',
        );
      }
    }

    const createData: CreateEventData = {
      hostId: payload.hostId,
      clubId: payload.clubId,
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityIds: payload.cityIds,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const event = await this.eventRepository.createEvent(createData);

    return EventDto.from(event);
  }

  async getEvent(eventId: number, user: UserBaseInfo): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    }
    if (event.clubId) {
      const isUserJoined = await this.eventRepository.isUserJoinedToEvent(
        eventId,
        user.id,
      );
      if (!isUserJoined) {
        throw new ConflictException(
          'Event에 참여하지 않은 사용자입니다. 해당 Event 정보를 볼 수 없습니다.',
        );
      }
    }
    if (event.archived) {
      const userJoinedEvents = new Set(
        await this.eventRepository.getEventIdsOfUser(user.id),
      );
      if (!userJoinedEvents.has(event.id)) {
        throw new ConflictException(
          '해당 유저가 참여했던 이벤트가 아닙니다. 리뷰를 볼 수 없습니다.',
        );
      }
    }
    return EventDto.from(event);
  }

  async getEvents(
    query: EventListQuery,
    user: UserBaseInfo,
  ): Promise<EventListDto> {
    const events = await this.eventRepository.getEvents(query); // 보려고 하는 이벤트를 전부 불러오고
    const filteredEvents = await this.filterEvents(events, user); // 필터링해서 보여줄 이벤트만 뽑아내기
    // 만약 클럽 Id가 있으면 해당 클럽 멤버인지 보고, 아니면 필터링해서 안보여주기
    // 만약 archived가 true면 참여한 이벤트인지 확인하고 아니면 필터링해서 안보여주기
    return EventListDto.from(filteredEvents);
  }

  async filterEvents(
    events: EventData[],
    user: UserBaseInfo,
  ): Promise<EventData[]> {
    const filteredEvents = events.filter(async (event) => {
      if (event.clubId) {
        const isUserJoinedClub = this.clubRepository.getUserIsClubMember(
          user.id,
          event.clubId,
        );
        if (!isUserJoinedClub) {
          return false;
        }
      }
      if (event.archived) {
        const userJoinedEventsIds = new Set(
          await this.eventRepository.getEventIdsOfUser(user.id),
        );
        if (!userJoinedEventsIds.has(event.id)) {
          return false;
        }
      }
      return true;
    });

    return filteredEvents;
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

    if (event.clubId) {
      const isClubMember = await this.clubRepository.getUserIsClubMember(
        userId,
        event.clubId,
      );
      if (!isClubMember) {
        throw new ConflictException('클럽 멤버만 참여할 수 있는 Event입니다.');
      }
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

    const startTime = payload.startTime ?? event.startTime;
    const endTime = payload.endTime ?? event.endTime;

    if (startTime < new Date()) {
      throw new ConflictException('이미 시작된 Event를 수정할 수 없습니다');
    }

    if (startTime >= endTime) {
      throw new BadRequestException('Event는 시작 후에 종료될 수 있습니다.');
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

    if (payload.cityIds) {
      const cityExist = await this.eventRepository.areCitysExist(
        payload.cityIds,
      );
      if (!cityExist) {
        throw new NotFoundException('해당 지역이 존재하지 않습니다.');
      }
    }

    const updateData: UpdateEventData = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityIds: payload.cityIds,
      startTime: startTime,
      endTime: endTime,
      maxPeople: payload.maxPeople,
    };

    const updatedEvent = await this.eventRepository.updateEvent(
      eventId,
      updateData,
    );

    return EventDto.from(updatedEvent);
  }

  async deleteEvent(eventId: number): Promise<void> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 Event가 존재하지 않습니다.');
    }

    if (event.startTime < new Date()) {
      throw new ConflictException('이미 시작된 Event를 삭제할 수 없습니다.');
    }

    await this.eventRepository.deleteEvent(eventId);
  }
}
