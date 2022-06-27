import { IsArray, IsEnum, IsString } from 'class-validator';
import {
  ActionFormat,
  EventTypeFormat,
} from '../../point/entities/point.entity';

export class EventDto {
  @IsEnum(EventTypeFormat)
  readonly type: EventTypeFormat;

  @IsEnum(ActionFormat)
  readonly action: ActionFormat;

  @IsString()
  readonly reviewId: string;

  @IsString()
  readonly content: string;

  @IsArray()
  readonly attachedPhotoIds: string[];

  @IsString()
  readonly userId: string;

  @IsString()
  readonly placeId: string;
}
