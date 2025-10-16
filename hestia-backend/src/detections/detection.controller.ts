import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DetectionsService } from './detection.service';
import { CreateDetectionDto } from './detection.dto';
import { Detection } from './entities/detection.entity';

@ApiTags('detections')
@Controller('detections')
export class DetectionsController {
  constructor(private readonly detectionsService: DetectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new detection' })
  @ApiResponse({
    status: 201,
    description: 'Detection created successfully',
    type: Detection,
  })
  create(@Body() createDto: CreateDetectionDto) {
    return this.detectionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all detections' })
  @ApiResponse({
    status: 200,
    description: 'List of detections retrieved successfully',
    type: [Detection],
  })
  findAll() {
    return this.detectionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detection by ID' })
  @ApiParam({ name: 'id', description: 'Detection ID' })
  @ApiResponse({ status: 200, description: 'Detection found', type: Detection })
  @ApiResponse({ status: 404, description: 'Detection not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.detectionsService.getById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete detection' })
  @ApiParam({ name: 'id', description: 'Detection ID' })
  @ApiResponse({ status: 200, description: 'Detection deleted successfully' })
  @ApiResponse({ status: 404, description: 'Detection not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.detectionsService.delete(id);
  }
}
