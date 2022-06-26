import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Place } from '../../place/entities/place.entity';
import { ReviewImage } from '../../reviewImage/entities/reviewImage.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'longtext' })
  content: string;

  @OneToMany(() => ReviewImage, (reviewImage) => reviewImage.review, {
    nullable: true,
    cascade: true,
  })
  image: ReviewImage[];

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Place)
  place: Place;
}
