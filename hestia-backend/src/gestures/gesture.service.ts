import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gesture } from './entities/gesture.entity';
import { CreateGestureDto, UpdateGestureDto } from './gesture.dto';

@Injectable()
export class GesturesService {
  constructor(
    @InjectRepository(Gesture)
    private gestureRepository: Repository<Gesture>,
  ) {}

  async create(createGestureDto: CreateGestureDto) {
    const newGesture = await this.gestureRepository.save(createGestureDto);
    return newGesture;
  }

  async findAll() {
    const gestures = await this.gestureRepository.find();
    return gestures;
  }

  async findOne(id: number) {
    const gesture = await this.gestureRepository.findOneBy({ id });
    if (!gesture) {
      throw new NotFoundException(`Gesture with id ${id} not found`);
    }
    return gesture;
  }

  async remove(id: number) {
    const gesture = await this.findOne(id);
    await this.gestureRepository.delete(gesture.id);
    return {
      message: 'Gesture deleted successfully',
    };
  }

  async update(id: number, changes: UpdateGestureDto) {
    const gesture = await this.findOne(id);
    const updateGesture = this.gestureRepository.merge(gesture, changes);
    return this.gestureRepository.save(updateGesture);
  }
}
