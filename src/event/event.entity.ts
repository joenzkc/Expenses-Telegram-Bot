import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegram_id: string;

  @Column({ unique: true })
  event_name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  budget: number;

  @Column({ default: true })
  is_active: boolean;
}
