import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GesturesService } from './gesture.service';
import { CreateGestureDto, UpdateGestureDto } from './gesture.dto';
import { Gesture } from './entities/gesture.entity';

@ApiTags('gestures')
@Controller('gestures')
export class GesturesController {
  constructor(private readonly gesturesService: GesturesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new gesture' })
  @ApiResponse({
    status: 201,
    description: 'Gesture created successfully',
    type: Gesture,
  })
  create(@Body() createGestureDto: CreateGestureDto) {
    return this.gesturesService.create(createGestureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all gestures' })
  @ApiResponse({
    status: 200,
    description: 'List of gestures retrieved successfully',
    type: [Gesture],
  })
  findAll() {
    return this.gesturesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gesture by ID' })
  @ApiParam({ name: 'id', description: 'Gesture ID' })
  @ApiResponse({ status: 200, description: 'Gesture found', type: Gesture })
  @ApiResponse({ status: 404, description: 'Gesture not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gesturesService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete gesture' })
  @ApiParam({ name: 'id', description: 'Gesture ID' })
  @ApiResponse({ status: 200, description: 'Gesture deleted successfully' })
  @ApiResponse({ status: 404, description: 'Gesture not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gesturesService.remove(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update gesture' })
  @ApiParam({ name: 'id', description: 'Gesture ID' })
  @ApiResponse({
    status: 200,
    description: 'Gesture updated successfully',
    type: Gesture,
  })
  @ApiResponse({ status: 404, description: 'Gesture not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateGestureDto,
  ) {
    return this.gesturesService.update(id, changes);
  }
}
