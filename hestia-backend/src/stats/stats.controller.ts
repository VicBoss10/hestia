import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { CreateStatDto } from './stats.dto';
import { Stat } from './entities/stat.entity';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new stat' })
  @ApiResponse({
    status: 201,
    description: 'Stat created successfully',
    type: Stat,
  })
  create(@Body() body: CreateStatDto) {
    return this.statsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stats' })
  @ApiResponse({
    status: 200,
    description: 'List of stats retrieved successfully',
    type: [Stat],
  })
  findAll() {
    return this.statsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stat by ID' })
  @ApiParam({ name: 'id', description: 'Stat ID' })
  @ApiResponse({ status: 200, description: 'Stat found', type: Stat })
  @ApiResponse({ status: 404, description: 'Stat not found' })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.statsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete stat' })
  @ApiParam({ name: 'id', description: 'Stat ID' })
  @ApiResponse({ status: 200, description: 'Stat deleted successfully' })
  @ApiResponse({ status: 404, description: 'Stat not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statsService.remove(id);
  }
}
