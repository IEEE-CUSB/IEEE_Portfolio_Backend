import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSocietyToVacancies1792679018399 implements MigrationInterface {
  name = 'AddSocietyToVacancies1792679018399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."vacancies_society_enum" AS ENUM('EMBS', 'PES', 'RAS', 'CS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "society" "public"."vacancies_society_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vacancies" DROP COLUMN "society"`);
    await queryRunner.query(`DROP TYPE "public"."vacancies_society_enum"`);
  }
}
