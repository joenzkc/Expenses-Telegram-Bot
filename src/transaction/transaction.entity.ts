import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegram_id: string;

  @Column()
  event_id: number;

  @Column()
  created_at: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column()
  description: string;

  @Column({ default: true })
  is_active: boolean;
}
