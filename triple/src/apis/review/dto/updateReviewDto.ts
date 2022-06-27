import { PickType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './createReviewDto';

export class UpdateReviewDto extends PickType(CreateReviewDto, [
  'content',
  'reviewImageUrls',
]) {}
