import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Place } from '../../place/entities/place.entity';
import { ReviewImage } from '../../reviewImage/entities/reviewImage.entity';
import { Point } from '../../point/entities/point.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class Review {
  @ApiProperty({
    example: 'UUID',
    description: '리뷰의 ID (UUID)',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '오사카가 재미있네요',
    description: '리뷰의 내용',
    required: true,
  })
  @Column({ type: 'longtext' })
  content: string;

  @ApiPropertyOptional({ type: () => [ReviewImage] })
  @OneToMany(() => ReviewImage, (reviewImage) => reviewImage.review, {
    nullable: true,
    cascade: true,
  })
  images?: ReviewImage[];

  @ApiPropertyOptional({
    type: () => User,
    required: true,
    description: '리뷰의 작성자',
  })
  @Index()
  @ManyToOne(() => User)
  user: User;

  @ApiPropertyOptional({
    type: () => Place,
    required: true,
    description: '리뷰의 장소',
  })
  @Index()
  @ManyToOne(() => Place)
  place: Place;

  @ApiPropertyOptional({
    type: () => [Point],
    required: false,
    nullable: true,
    description: '리뷰로 발생한 포인트',
  })
  @OneToMany(() => Point, (point) => point.review, {
    nullable: true,
  })
  point?: Point[];

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: '리뷰의 작성일',
  })
  @CreateDateColumn()
  readonly createdAt?: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: '리뷰의 수정일',
  })
  @UpdateDateColumn()
  readonly updatedAt?: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: '리뷰의 삭제일',
  })
  @DeleteDateColumn()
  readonly deletedAt?: Date;
}
