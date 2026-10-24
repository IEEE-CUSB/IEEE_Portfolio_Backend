import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMainToSocities1792881951071 implements MigrationInterface {
  name = 'AddMainToSocities1792881951071';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."vacancies_society_enum" RENAME TO "vacancies_society_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vacancies_society_enum" AS ENUM('EMBS', 'PES', 'RAS', 'CS', 'MAIN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ALTER COLUMN "society" TYPE "public"."vacancies_society_enum" USING "society"::"text"::"public"."vacancies_society_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."vacancies_society_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."vacancies_society_enum_old" AS ENUM('EMBS', 'PES', 'RAS', 'CS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ALTER COLUMN "society" TYPE "public"."vacancies_society_enum_old" USING "society"::"text"::"public"."vacancies_society_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."vacancies_society_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."vacancies_society_enum_old" RENAME TO "vacancies_society_enum"`,
    );
  }
}
