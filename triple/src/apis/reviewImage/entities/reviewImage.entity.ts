import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from '../../review/entities/review.entity';

@Entity()
export class ReviewImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @ManyToOne(() => Review)
  review: Review;
}
