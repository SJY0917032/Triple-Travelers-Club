import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Review } from '../../review/entities/review.entity';

@Entity()
export class ReviewImage {
  @ApiProperty({
    example: 'REVIEW IMAGE UUID',
    description: '리뷰사진의 ID (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '사진1URL',
    description: '사진의 URL',
    required: true,
  })
  @Column({ nullable: false })
  @Index()
  url: string;

  @ApiPropertyOptional({
    type: () => Review,
    required: true,
    description: '사진을 연결할 리뷰',
  })
  @ManyToOne(() => Review)
  review: Review;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: '리뷰이미지의 작성일',
  })
  @CreateDateColumn()
  readonly createdAt?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: '리뷰이미지의 수정일',
  })
  @UpdateDateColumn()
  readonly updatedAt?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: '리뷰이미지의 삭제일',
  })
  @DeleteDateColumn()
  readonly deletedAt?: Date;
}
