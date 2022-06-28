import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateIf } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: '오사카가 재밌네요',
    description: '리뷰의 내용입니다',
    required: true,
  })
  @IsString()
  readonly content: string;

  @ApiProperty({
    example: 'USER UUID',
    description: '유저의 UUID값 입니다',
    required: true,
  })
  @IsString()
  readonly userId: string;

  @ApiProperty({
    example: 'PLACE UUID',
    description: '장소의 UUID값 입니다',
    required: true,
  })
  @IsString()
  readonly placeId: string;

  @ApiProperty({
    example: ['사진URL1', '사진URL2'],
    description: '사진URL을 배열로 넣은 값입니다.',
    required: false,
  })
  @IsArray()
  @ValidateIf((_, value) => value != null)
  readonly reviewImageUrls?: string[] | undefined;
}
