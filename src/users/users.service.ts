import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async getUsers() {
    return this.userRepository.find();
  }

  /**
   * Finds a user based on their telegram ID
   * @param id Telegram ID
   */
  async findUserTelegramId(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const users: User[] = await queryRunner.manager.find(User, {
        where: { telegram_id: id },
      });
      await queryRunner.commitTransaction();
      return users[0];
    } catch (err) {
      console.log(err);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Returns the active event id
   */
  async getActiveEventId(telegram_id: string) {
    const user = await this.findUserTelegramId(telegram_id);
    return user.activeEventId;
  }

  async setActiveEventId(telegram_id: string, event_id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { telegram_id },
      });
      user.activeEventId = event_id;
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Creates a new user profile in the database
   * @param dto User information
   */
  async createUser(dto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user: User = this.userRepository.create(dto);
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
