import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Gesture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column('text')
  description: string;

  @Column({ length: 100 })
  action_assigned: string;

  @CreateDateColumn()
  created_at: Date;
}
