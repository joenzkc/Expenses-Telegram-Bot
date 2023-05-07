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
    } finally {
      await queryRunner.release();
    }
  }

  async test() {
    console.log('test');
  }
}
