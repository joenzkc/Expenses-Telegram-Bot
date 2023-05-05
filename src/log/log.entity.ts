import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegram_id: string;

  @Column()
  type: string;

  @Column({ default: null })
  prev_id: number;

  @Column()
  time: number;
}
