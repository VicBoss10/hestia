import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GesturesService } from './gesture.service';
import { GesturesController } from './gesture.controller';
import { Gesture } from './entities/gesture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gesture])],
  controllers: [GesturesController],
  providers: [GesturesService],
})
export class GesturesModule {}
