import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGestureDto {
  @ApiProperty({
    description: 'The name of the gesture',
    example: 'Wave Hand',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Description of the gesture',
    example: 'Wave hand from left to right',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Action to be performed when gesture is detected',
    example: 'Switch light on',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  action_assigned: string;
}

export class UpdateGestureDto {
  @ApiProperty({
    description: 'The name of the gesture',
    example: 'Wave Hand',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Description of the gesture',
    example: 'Wave hand from left to right',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Action to be performed when gesture is detected',
    example: 'Switch light on',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  action_assigned: string;
}
