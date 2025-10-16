import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectionsService } from './detection.service';
import { DetectionsController } from './detection.controller';
import { Detection } from './entities/detection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Detection])],
  controllers: [DetectionsController],
  providers: [DetectionsService],
  exports: [DetectionsService],
})
export class GestureDetectionsModule {}
