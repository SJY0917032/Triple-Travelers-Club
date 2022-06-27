import { IsArray, IsString, ValidateIf } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  readonly content: string;

  @IsString()
  readonly userId: string;

  @IsString()
  readonly placeId: string;

  @IsArray()
  @ValidateIf((_, value) => value != null)
  readonly reviewImageUrls?: string[] | undefined;
}
