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
    example: 'REVIEW UUID',
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
    example: '["reviewImage UUID 1", "reviewImage UUID 2"]',
    description: '이벤트가 발생한 review의 reviewImage ID (UUID) 배열',
    required: true,
  })
  @IsArray()
  readonly attachedPhotoIds: string[];

  @ApiProperty({
    example: 'USER UUID',
    description: '이벤트가 발생한 review를 작성한 User의 ID (UUID)',
    required: true,
  })
  @IsString()
  readonly userId: string;

  @ApiProperty({
    example: 'PLACE UUID',
    description: '이벤트가 발생한 review의 place ID (UUID)',
    required: true,
  })
  @IsString()
  readonly placeId: string;
}
