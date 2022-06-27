import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
  CreateDateColumn,
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

export enum ReasonFormat {
  REVIEW_ADD = 'REVIEW_ADD',
  REVIEW_ADD_with_PHOTO = 'REVIEW_ADD_with_PHOTO',
  REVIEW_ADD_FIRST_PLACE = 'REVIEW_ADD_FIRST_PLACE',
  REVIEW_MOD_ADD_PHOTO = 'REVIEW_MOD_ADD_PHOTO',
  REVIEW_MOD_DELETE_PHOTO = 'REVIEW_MOD_DELETE_PHOTO',
  REVIEW_DELETE = 'REVIEW_DELETE',
  REVIEW_DELETE_with_PHOTO = 'REVIEW_DELETE_with_PHOTO',
  REVIEW_DELETE_FIRST_PLACE = 'REVIEW_DELETE_FIRST_PLACE',
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
  reason: ReasonFormat;

  @Column({ type: 'decimal' })
  score: number;

  @Index()
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Review)
  review: Review;

  @CreateDateColumn()
  createdAt: Date;
}
