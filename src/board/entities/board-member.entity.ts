import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('board')
export class BoardMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  role!: string;

  @Column({ type: 'varchar', nullable: true })
  image_url!: string | null;

  @Column({ type: 'varchar', nullable: true })
  image_public_id!: string | null;

  @Column({ type: 'int', nullable: true })
  display_order!: number;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', nullable: true })
  linkedin!: string | null;

  @Column({ type: 'varchar', nullable: true })
  github!: string | null;

  @Column({ type: 'varchar', nullable: true })
  twitter!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
