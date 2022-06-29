import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsObject } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class UserPointDto {
  @ApiPropertyOptional({
    description: '유저',
    type: User,
    required: true,
  })
  @IsObject()
  readonly user: User;

  @ApiProperty({
    description: '유저의 포인트 총합',
    type: Number,
    required: true,
  })
  @IsNumber()
  readonly totalPoint: number;
}
