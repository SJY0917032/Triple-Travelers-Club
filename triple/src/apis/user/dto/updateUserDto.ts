import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './createUserDto';

export class UpdateUserDto extends PickType(CreateUserDto, ['nickName']) {
  @ApiProperty({
    example: '수정중인이름',
    description: '수정할 닉네임입니다',
    required: true,
  })
  nickName: string;
}
