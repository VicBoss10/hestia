import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Detection } from './entities/detection.entity';
import { CreateDetectionDto } from './detection.dto';
import { Gesture } from '../gestures/entities/gesture.entity';

@Injectable()
export class DetectionsService {
  constructor(
    @InjectRepository(Detection)
    private detectionRepository: Repository<Detection>,
  ) {}

  async findAll() {
    const detections = await this.detectionRepository.find();
    return detections;
  }

  async getById(id: number) {
    const detection = await this.findOne(id);
    return detection;
  }

  async create(body: CreateDetectionDto) {
    const toSave = this.detectionRepository.create({
      confidence: body.confidence,
      frame_time: new Date(body.frame_time),
      gesture: { id: body.gesture_id } as Gesture,
    });
    const newDetection = await this.detectionRepository.save(toSave);
    return newDetection;
  }

  async delete(id: number) {
    const detection = await this.findOne(id);
    await this.detectionRepository.delete(detection.id);
    return {
      message: 'Detection deleted successfully',
    };
  }

  private async findOne(id: number) {
    const detection = await this.detectionRepository.findOneBy({ id });
    if (!detection) {
      throw new NotFoundException(`Detection with id ${id} not found`);
    }
    return detection;
  }
}
