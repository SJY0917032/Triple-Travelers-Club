import { Column, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from '../../review/entities/review.entity';

export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  name: string;

  @OneToMany(() => Review, (review) => review.place, {
    nullable: true,
    cascade: true,
  })
  reviews?: Review[];
}
