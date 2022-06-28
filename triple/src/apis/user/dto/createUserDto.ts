import { IsEmail, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 *
 * 유저생성시 사용하는 DTO
 *
 * 비밀번호는 영문대소문자 숫자 또는 특수문자로 이루어진 6자이상 30자이하의 문자열
 *
 */
export class CreateUserDto {
  @ApiProperty({
    example: '트리플러1',
    description: '유저 닉네임',
    required: true,
  })
  @Transform((params) => params.value.trim())
  @IsString()
  readonly nickName: string;

  @ApiProperty({
    example: 'triple@triple.com',
    description: '유저의 이메일주소',
    required: true,
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '123456',
    description: '유저의 비밀번호, 6자이상 30자이하, 유저 생성시 암호화됨',
    required: true,
  })
  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  readonly password: string;
}
