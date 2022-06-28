import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';
import { Review } from '../../review/entities/review.entity';

export class CreateReviewImageDto {
  @ApiProperty({
    example: '사진1URL',
    description: '사진의 URL',
  })
  @IsArray()
  readonly url: string;

  @ApiPropertyOptional({
    type: () => Review,
    required: true,
    description: '사진을 연결할 리뷰',
  })
  @IsObject()
  readonly review: Review;
}
