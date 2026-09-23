import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVacancyQuestion1789680133681 implements MigrationInterface {
    name = 'AddVacancyQuestion1789680133681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."vacancy_questions_type_enum" AS ENUM('TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'FILE')`);
        await queryRunner.query(`CREATE TABLE "vacancy_questions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "vacancy_id" uuid NOT NULL, "question_text" text NOT NULL, "type" "public"."vacancy_questions_type_enum" NOT NULL, "options" text array, "is_required" boolean NOT NULL DEFAULT true, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_8c484fb5d0d456e6683cb1a0dbd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vacancy_questions" ADD CONSTRAINT "FK_58c4f7f057db041eaee1a625954" FOREIGN KEY ("vacancy_id") REFERENCES "vacancies"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vacancy_questions" DROP CONSTRAINT "FK_58c4f7f057db041eaee1a625954"`);
        await queryRunner.query(`DROP TABLE "vacancy_questions"`);
        await queryRunner.query(`DROP TYPE "public"."vacancy_questions_type_enum"`);
    }

}
