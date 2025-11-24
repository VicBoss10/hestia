import { Test, TestingModule } from '@nestjs/testing';
import { MediaPipeService } from './media-pipe.service';

describe('MediaPipeService', () => {
  let service: MediaPipeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaPipeService],
    }).compile();

    service = module.get<MediaPipeService>(MediaPipeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
