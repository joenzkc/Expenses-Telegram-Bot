import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async createTransaction(dto: CreateTransactionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const xact: Transaction = this.transactionRepo.create(dto);
      await queryRunner.manager.save(xact);
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async retrieveAllTransactions(telegram_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const xacts: Transaction[] = await queryRunner.manager.find(Transaction, {
        where: { telegram_id },
      });
      return xacts;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async retrieveTransactionsEventId(event_id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const xacts: Transaction[] = await queryRunner.manager.find(Transaction, {
        where: { event_id },
        order: { created_at: 'desc' },
      });
      return xacts;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updateTransactionDescription(
    transaction_id: number,
    new_description: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const xact: Transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transaction_id },
      });
      xact.description = new_description;
      await queryRunner.manager.save(xact);
      await queryRunner.commitTransaction();
      return xact;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updateTransactionCost(transaction_id: number, new_cost: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const xact: Transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transaction_id },
      });
      xact.cost = new_cost;
      await queryRunner.manager.save(xact);
      await queryRunner.commitTransaction();
      return xact;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
