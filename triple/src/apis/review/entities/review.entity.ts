import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Place } from '../../place/entities/place.entity';
import { ReviewImage } from '../../reviewImage/entities/reviewImage.entity';
import { Point } from '../../point/entities/point.entity';

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
  images: ReviewImage[];

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Place)
  place: Place;

  @OneToMany(() => Point, (point) => point.review, {
    nullable: true,
  })
  point?: Point[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
