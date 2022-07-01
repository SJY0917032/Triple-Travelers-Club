import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    example: 'POINT UUID',
    description: 'Point의 ID (UUID)',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: EventTypeFormat.REVIEW,
    description: '이벤트가 발생한곳의 타입',
    required: true,
  })
  @Column({ nullable: false })
  type: EventTypeFormat;

  @ApiProperty({
    example: ActionFormat.ADD,
    description: '이밴트 발생 타입',
    required: true,
  })
  @Column({ nullable: false })
  action: ActionFormat;

  @ApiProperty({
    example: ReasonFormat.REVIEW_ADD,
    description: '이벤트가 발생 타입의 상세 이유',
  })
  @Column({ nullable: false })
  reason: ReasonFormat;

  @ApiProperty({
    example: 1,
    description: '이벤트로 발생한 증가,차감된 점수',
    required: true,
  })
  @Column({ type: 'decimal', nullable: false })
  score: number;

  @ApiPropertyOptional({
    type: () => User,
  })
  @ManyToOne(() => User)
  @Index()
  user: User;

  @ApiPropertyOptional({ type: () => Review })
  @ManyToOne(() => Review)
  review: Review;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: '이벤트 발생일',
  })
  @CreateDateColumn()
  createdAt: Date;
}
