import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event) private eventRepository: Repository<Event>,
    private dataSource: DataSource,
  ) {}

  /**
   * Creates a new event
   * @param dto
   */
  async createEvent(dto: CreateEventDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event: Event = await this.eventRepository.create(dto);
      await queryRunner.manager.save(event);
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deactivateEvent(event_id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const event: Event = await queryRunner.manager.findOne(Event, {
        where: { id: event_id },
      });
      event.is_active = false;
      await queryRunner.manager.save(event);
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getActiveEvents(telegram_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const events: Event[] = await queryRunner.manager.find(Event, {
        where: { telegram_id, is_active: true },
      });
      return events;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getEvent(telegram_id: string, event_name: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const event: Event = await queryRunner.manager.findOne(Event, {
        where: { telegram_id, event_name },
      });
      return event;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getEventWithId(event_id: number) {
    return await this.eventRepository.findOne({ where: { id: event_id } });
  }

  async test() {
    console.log('test');
  }
}
