import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['student', 'teacher', 'staff', 'parent','admin'])
  userType: string;
} 