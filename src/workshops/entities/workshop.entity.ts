import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Instructor } from './instructor.entity';
import { WorkshopRegistration } from './workshop-registration.entity';
import { WorkshopImage } from './workshop-image.entity';
import { Category } from '../../categories/entities/category.entity';

export interface WorkshopContent {
  sectionTitle: string;
  subSection: string[];
}

@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'jsonb' })
  content!: WorkshopContent[];

  @Column({ type: 'varchar', nullable: true })
  image_url!: string | null;

  @Column({ type: 'varchar', nullable: true })
  image_public_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  category_id!: string | null;

  @ManyToOne(() => Category, (category) => category.workshops, {
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

  @ManyToMany(() => Instructor, (instructor) => instructor.workshops, {
    cascade: true,
  })
  @JoinTable({
    name: 'workshops_instructors_join',
    joinColumn: { name: 'workshop_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'instructor_id', referencedColumnName: 'id' },
  })
  instructors!: Instructor[];

  @OneToMany(
    () => WorkshopRegistration,
    (registration) => registration.workshop,
  )
  registrations!: WorkshopRegistration[];

  @OneToMany(() => WorkshopImage, (image) => image.workshop)
  images!: WorkshopImage[];

  @Column({ default: true })
  is_published!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
