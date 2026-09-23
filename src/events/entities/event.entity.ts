import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventRegistration } from './event-registration.entity';
import { EventImage } from './event-image.entity';

import { Category } from '../../categories/entities/category.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  image_url!: string | null;

  @Column({ type: 'varchar', nullable: true })
  image_public_id!: string | null;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'uuid', nullable: true })
  category_id!: string | null;

  @ManyToOne(() => Category, (category) => category.events, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  @Column()
  location!: string;

  @Column({ type: 'timestamp' })
  start_time!: Date;

  @Column({ type: 'timestamp' })
  end_time!: Date;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'timestamp' })
  registration_deadline!: Date;

  @Column('uuid')
  created_by!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @OneToMany(() => EventRegistration, (registration) => registration.event)
  registrations!: EventRegistration[];

  @OneToMany(() => EventImage, (image) => image.event)
  images!: EventImage[];

  @Column({ default: true })
  is_published!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
