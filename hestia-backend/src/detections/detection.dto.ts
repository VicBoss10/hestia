import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDetectionDto {
  @ApiProperty({
    description: 'The ID of the detected gesture',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  gesture_id: number;

  @ApiProperty({
    description: 'Confidence score of the detection',
    example: 0.95,
    minimum: 0,
    maximum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  confidence: number;

  @ApiProperty({
    description: 'Timestamp of the detection',
    example: '2025-10-16T14:30:00Z',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  frame_time: string;

  @ApiProperty({
    description: 'Unique identifier of the device',
    example: 'device_123',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  device_id: string;
}

// export class UpdateDetectionDto {
//   @IsNotEmpty()
//   @IsNumber()
//   gesture_id: number;

//   @IsNotEmpty()
//   @IsNumber()
//   confidence: number;

//   @IsNotEmpty()
//   @IsDateString()
//   frame_time: string;

//   @IsNotEmpty()
//   @IsString()
//   @MaxLength(50)
//   device_id: string;
// }
