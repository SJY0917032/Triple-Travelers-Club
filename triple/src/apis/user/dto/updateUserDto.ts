import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './createUserDto';

export class UpdateUserDto extends PickType(CreateUserDto, ['nickName']) {}
