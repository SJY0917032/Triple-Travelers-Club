import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Review } from '../../review/entities/review.entity';
import { User } from '../../user/entities/user.entity';

export enum EventTypeFormat {
  REVIEW = 'REVIEW',
}

export enum ActionFormat {
  ADD = 'ADD',
  MOD = 'MOD',
  DELETE = 'DELETE',
}

@Entity()
export class Point {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: EventTypeFormat;

  @Column()
  action: ActionFormat;

  @Column()
  score: number;

  @Index()
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Review)
  review: Review;
}
