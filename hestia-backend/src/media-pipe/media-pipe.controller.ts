import { Controller, Post } from '@nestjs/common';
import { MediaPipeService } from './media-pipe.service';

@Controller('media-pipe')
export class MediaPipeController {
  constructor(private readonly mediaPipeService: MediaPipeService) {}

  @Post('start')
  start() {
    return this.mediaPipeService.start();
  }

  @Post('stop')
  stop() {
    return this.mediaPipeService.stop();
  }
}
