import { IsEmail, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 *
 * 유저생성시 사용하는 DTO
 *
 * 비밀번호는 영문대소문자 숫자 또는 특수문자로 이루어진 6자이상 30자이하의 문자열
 *
 */
export class CreateUserDto {
  @Transform((params) => params.value.trim())
  @IsString()
  readonly nickName: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{6,30}$/)
  readonly password: string;
}
