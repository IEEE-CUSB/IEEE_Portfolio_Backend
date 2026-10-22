import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSocialsToBoard1791370916304 implements MigrationInterface {
    name = 'AddSocialsToBoard1791370916304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board" ADD "bio" text`);
        await queryRunner.query(`ALTER TABLE "board" ADD "linkedin" character varying`);
        await queryRunner.query(`ALTER TABLE "board" ADD "github" character varying`);
        await queryRunner.query(`ALTER TABLE "board" ADD "twitter" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "twitter"`);
        await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "github"`);
        await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "linkedin"`);
        await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "bio"`);
    }

}
