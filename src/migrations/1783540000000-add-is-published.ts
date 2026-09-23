import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPublished1783540000000 implements MigrationInterface {
  name = 'AddIsPublished1783540000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" ADD "is_published" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "workshops" ADD "is_published" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "workshops" DROP COLUMN "is_published"`);
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "is_published"`);
  }
}
