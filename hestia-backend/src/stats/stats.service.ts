import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stat } from './entities/stat.entity';
import { CreateStatDto } from './stats.dto';
import { Gesture } from '../gestures/entities/gesture.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Stat)
    private statsRepository: Repository<Stat>,
  ) {}

  async create(body: CreateStatDto) {
    const toSave = this.statsRepository.create({
      times_detected: body.times_detected,
      avg_confidence: body.avg_confidence,
      last_detected: new Date(body.last_detected),
      gesture: { id: body.gesture_id } as Gesture,
    });
    return this.statsRepository.save(toSave);
  }

  async findAll() {
    return this.statsRepository.find();
  }

  async findOne(id: number) {
    const stat = await this.statsRepository.findOneBy({ id });
    if (!stat) {
      throw new NotFoundException(`Stat with id ${id} not found`);
    }
    return stat;
  }

  async remove(id: number) {
    const stat = await this.findOne(id);
    await this.statsRepository.delete(stat.id);
    return { message: 'Stat deleted successfully' };
  }
}
