import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Review } from '../../review/entities/review.entity';

@Entity()
export class Place {
  @ApiProperty({
    example: 'UUID',
    description: '장소의 ID (UUID)',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '오사카',
    description: '장소의 이름',
    required: true,
  })
  @Index()
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: '장소의 리뷰들을 배열형태로 반환합니다.',
    description: '장소의 리뷰들',
    required: false,
  })
  @OneToMany(() => Review, (review) => review.place, {
    nullable: true,
    cascade: true,
  })
  reviews?: Review[];
}
