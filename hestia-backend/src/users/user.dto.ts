import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'user',
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'The Firebase UID of the user',
    example: 'firebase-uid-123',
  })
  @IsString()
  @IsOptional()
  firebaseUid?: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'user',
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'The Firebase UID of the user',
    example: 'firebase-uid-123',
  })
  @IsString()
  @IsOptional()
  firebaseUid?: string;
}
