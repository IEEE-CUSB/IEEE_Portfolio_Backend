import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAllowMultipleSelection1789688000000 implements MigrationInterface {
  name = 'AddAllowMultipleSelection1789688000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" ADD "allow_multiple_selection" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vacancy_questions" DROP COLUMN "allow_multiple_selection"`);
  }
}
