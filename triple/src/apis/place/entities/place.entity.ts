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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Review, (review) => review.place, {
    nullable: true,
    cascade: true,
  })
  reviews?: Review[];
}
