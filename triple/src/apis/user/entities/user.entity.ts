import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Review } from '../../review/entities/review.entity';

import { Point } from '../../point/entities/point.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({
    example: 'USER UUID',
    description: '유저의 ID (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'triple@triple.com',
    description: '유저의 이메일주소',
    required: true,
  })
  @Index()
  @Column()
  email: string;

  @ApiProperty({
    example: '트리플러1',
    description: '유저의 닉네임',
    required: true,
  })
  @Column()
  nickName: string;

  @ApiProperty({
    example: '123456',
    description: '유저의 비밀번호, 6자이상 30자이하, 유저 생성시 암호화됨',
    required: true,
  })
  @Column()
  password: string;

  @ApiProperty({
    example: 1,
    description: '유저의 레벨',
    default: 1,
  })
  @Column({ default: 1 })
  level: number;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: '유저의 생성일',
  })
  @CreateDateColumn()
  readonly createdAt?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: '유저의 수정일',
  })
  @UpdateDateColumn()
  readonly updatedAt?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: '유저의 삭제일',
  })
  @DeleteDateColumn()
  readonly deletedAt?: Date;

  @ApiPropertyOptional({
    type: () => [Review],
    required: false,
    nullable: true,
    description: '유저의 리뷰',
  })
  @OneToMany(() => Review, (review) => review.user, {
    nullable: true,
    cascade: true,
  })
  reviews?: Review[];

  @ApiPropertyOptional({
    type: () => [Point],
    required: false,
    nullable: true,
    description: '유저의 포인트',
  })
  @OneToMany(() => Point, (point) => point.user, {
    nullable: true,
    cascade: true,
  })
  points?: Point[];
}
