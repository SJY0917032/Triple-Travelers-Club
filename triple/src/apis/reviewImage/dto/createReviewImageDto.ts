import { IsArray, IsObject } from 'class-validator';
import { Review } from '../../review/entities/review.entity';

export class CreateReviewImageDto {
  @IsArray()
  readonly url: string;

  @IsObject()
  readonly review: Review;
}
