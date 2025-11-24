import { Test, TestingModule } from '@nestjs/testing';
import { MediaPipeController } from './media-pipe.controller';

describe('MediaPipeController', () => {
  let controller: MediaPipeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaPipeController],
    }).compile();

    controller = module.get<MediaPipeController>(MediaPipeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
