import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './log.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log) private logRepository: Repository<Log>,
    private dataSource: DataSource,
  ) {}

  /**
   * Creates a log
   * @param dto
   */
  async createLog(dto: CreateLogDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const log: Log = await this.logRepository.create(dto);
      const prev_id = (
        await queryRunner.manager.find(Log, {
          where: { telegram_id: dto.telegram_id },
          order: { id: 'DESC' },
        })
      )[0].id;
      if (prev_id) {
        log.prev_id = prev_id;
      }
      await queryRunner.manager.save(log);
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
