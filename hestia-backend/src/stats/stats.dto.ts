import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsISO8601,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStatDto {
  @ApiProperty({
    description: 'The ID of the gesture being tracked',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  gesture_id: number;

  @ApiProperty({
    description: 'Number of times this gesture was detected',
    example: 5,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  times_detected: number;

  @ApiProperty({
    description: 'Average confidence score for the gesture detections',
    example: 0.956,
    minimum: 0,
    maximum: 1,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(1)
  avg_confidence: number;

  @ApiProperty({
    description: 'Timestamp of the last detection',
    example: '2025-10-16T14:30:00Z',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsISO8601()
  last_detected: string;
}
