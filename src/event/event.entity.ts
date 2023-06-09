import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['telegram_id', 'event_name'])
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegram_id: string;

  @Column()
  event_name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  budget: number;

  @Column({ default: true })
  is_active: boolean;
}
