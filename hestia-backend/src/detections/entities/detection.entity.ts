import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Gesture } from '../../gestures/entities/gesture.entity';

@Entity()
export class Detection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Gesture, { nullable: false })
  @JoinColumn({ name: 'gesture_id' })
  gesture: Gesture;

  @RelationId((d: Detection) => d.gesture)
  gesture_id: number;

  @Column('decimal', { precision: 4, scale: 3 })
  confidence: number;

  @Column({ type: 'timestamp' })
  frame_time: Date;
}
