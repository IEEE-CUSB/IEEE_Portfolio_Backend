import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from './application.entity';

import { Category } from '../../categories/entities/category.entity';
import { VacancyQuestion } from './vacancy-question.entity';

@Entity('vacancies')
export class Vacancy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  image_url!: string | null;

  @Column({ type: 'varchar', nullable: true })
  image_public_id!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ default: false })
  is_open!: boolean;

  @Column({ type: 'uuid', nullable: true })
  category_id!: string | null;

  @ManyToOne(() => Category, (category) => category.vacancies, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  @OneToMany(() => Application, (application) => application.vacancy)
  applications!: Application[];

  @OneToMany(() => VacancyQuestion, (question) => question.vacancy, { cascade: true })
  questions!: VacancyQuestion[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
