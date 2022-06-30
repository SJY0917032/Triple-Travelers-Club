import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateReviewDto } from './createReviewDto';

export class UpdateReviewDto extends PickType(CreateReviewDto, [
  'content',
  'reviewImageUrls',
]) {
  @ApiProperty({
    example: '수정중!',
    description: '수정할 리뷰 내용입니다',
    required: false,
  })
  readonly content: string;

  @ApiProperty({
    example: ['reviewImage URL 1', 'reviewImage URL 2'],
    description: '수정할 리뷰의 reviewImage URL 배열입니다',
    required: true,
  })
  readonly reviewImageUrls: string[];
}
