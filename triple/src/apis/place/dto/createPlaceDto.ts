import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({
    example: '오사카',
    description: '장소의 이름',
    required: true,
  })
  @IsString()
  readonly name: string;
}
