import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';
import {
  ActionFormat,
  EventTypeFormat,
} from '../../point/entities/point.entity';

export class EventDto {
  @ApiProperty({
    example: EventTypeFormat.REVIEW,
    description: '이벤트가 발생한곳의 타입',
    required: true,
  })
  @IsEnum(EventTypeFormat)
  readonly type: EventTypeFormat;

  @ApiProperty({
    example: ActionFormat.ADD,
    description: '이밴트 발생 타입',
    required: true,
  })
  @IsEnum(ActionFormat)
  readonly action: ActionFormat;

  @ApiProperty({
    example: 'ed3c7650-1f5c-470c-a62b-addefe8a0982',
    description: '이벤트가 발생한 review의 ID (UUID)',
    required: true,
  })
  @IsString()
  readonly reviewId: string;

  @ApiProperty({
    example: '리뷰의 내용입니다',
    description: '이벤트가 발생한 review의 Content (long text)',
    required: true,
  })
  @IsString()
  readonly content: string;

  @ApiProperty({
    example: '["사진1", "사진2"]',
    description: '이벤트가 발생한 review의 image',
    required: true,
  })
  @IsArray()
  readonly attachedPhotoIds: string[];

  @ApiProperty({
    example: '016b1c8b-16e8-41fd-d6d5-a7377a37ec65',
    description: '이벤트가 발생한 review를 작성한 User의 ID (UUID)',
    required: true,
  })
  @IsString()
  readonly userId: string;

  @ApiProperty({
    example: '378d7f7d-b24b-4ae5-8f5e-7d21c449549f',
    description: '이벤트가 발생한 review의 place ID (UUID)',
    required: true,
  })
  @IsString()
  readonly placeId: string;
}
