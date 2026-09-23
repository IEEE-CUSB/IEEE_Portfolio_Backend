import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AwardSource } from '../enums/award-source.enum';

@Entity('awards')
export class Award {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  image_url!: string | null;

  @Column({ type: 'varchar', nullable: true })
  image_public_id!: string | null;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'int', array: true, default: [] })
  years!: number[];

  @Column({ type: 'jsonb', nullable: true })
  details!: any;

  @Column({ type: 'enum', enum: AwardSource, default: AwardSource.GLOBAL })
  source!: AwardSource;

  @Column({ type: 'int' })
  won_count!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
