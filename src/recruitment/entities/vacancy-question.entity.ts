import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vacancy } from './vacancy.entity';

export enum QuestionType {
  TEXT = 'TEXT',
  LONG_TEXT = 'LONG_TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILE = 'FILE',
}

@Entity('vacancy_questions')
export class VacancyQuestion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  vacancy_id!: string;

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.questions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy!: Vacancy;

  @Column({ type: 'text' })
  question_text!: string;

  @Column({ type: 'enum', enum: QuestionType })
  type!: QuestionType;

  @Column({ type: 'text', array: true, nullable: true })
  options!: string[] | null;

  @Column({ type: 'boolean', default: true })
  is_required!: boolean;

  @Column({ type: 'int', default: 0 })
  order!: number;
  @Column({ type: 'boolean', default: false })
  allow_multiple_selection!: boolean;
}
