import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MediaPipeController } from './media-pipe.controller';
import { MediaPipeService } from './media-pipe.service';

@Module({
  imports: [HttpModule],
  controllers: [MediaPipeController],
  providers: [MediaPipeService],
})
export class MediaPipeModule {}
