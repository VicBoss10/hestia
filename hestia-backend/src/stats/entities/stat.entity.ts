import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Gesture } from '../../gestures/entities/gesture.entity';

@Entity('stats')
export class Stat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Gesture, { nullable: false })
  @JoinColumn({ name: 'gesture_id' })
  gesture: Gesture;

  @RelationId((s: Stat) => s.gesture)
  gesture_id: number;

  @Column('int')
  times_detected: number;

  @Column('decimal', { precision: 4, scale: 3 })
  avg_confidence: number;

  @Column({ type: 'timestamp' })
  last_detected: Date;
}
