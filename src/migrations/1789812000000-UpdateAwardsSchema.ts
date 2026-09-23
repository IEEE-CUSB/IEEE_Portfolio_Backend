import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAwardsSchema1789812000000 implements MigrationInterface {
  name = 'UpdateAwardsSchema1789812000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "awards" DROP COLUMN IF EXISTS "year"`);
    await queryRunner.query(`ALTER TABLE "awards" ADD COLUMN IF NOT EXISTS "years" integer[] DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "awards" ADD COLUMN IF NOT EXISTS "details" jsonb DEFAULT '{}'::jsonb`);
    
    // Clear existing dummy awards to prevent duplicates
    await queryRunner.query(`DELETE FROM "awards"`);

    // Insert all real awards
    await queryRunner.query(`
      INSERT INTO "awards" (title, description, won_count, source, years, details) VALUES
      (
        'IEEE Outstanding Branch Counselor and Branch Chapter Advisor Award',
        'Award for the exceptional and dedicated efforts of Student Branch Counsellors and Branch Chapter Advisors.',
        4,
        'GLOBAL',
        ARRAY[2025, 2022, 2015, 2012],
        '{"2025": "Dr. Rania Osama", "2022": "Dr. Ahmed Khattab", "2015": "Dr. Mohamed Khairy", "2012": "Dr. Mohamed Khairy"}'::jsonb
      ),
      (
        'IEEE Regional Exemplary Student Branch Award',
        'The purpose of this award is to provide public recognition of exemplary IEEE Student Branch operations.',
        13,
        'REGION_8',
        ARRAY[2025, 2024, 2023, 2022, 2021, 2020, 2018, 2017, 2014, 2013, 2012, 2011, 2010],
        '{}'::jsonb
      ),
      (
        'The Darrel Chong Student Activity Award',
        'Recognizes exemplary IEEE Student Branch activities that create meaningful value and impact. Encourages student groups to focus on quality and innovation.',
        1,
        'GLOBAL',
        ARRAY[2024],
        '{"2024": "Category: Silver"}'::jsonb
      ),
      (
        'IEEE Day Photo Contest',
        'An annual global competition that invites IEEE Organizational Units to visually showcase their community impact.',
        4,
        'GLOBAL',
        ARRAY[2022, 2021, 2010, 2009],
        '{"2022": "1st place", "2021": "2nd place"}'::jsonb
      ),
      (
        'IEEE Region 8 Outstanding Student Branch Website Award',
        'Recognizes student websites that provide information about activities, latest tech updates, and learning opportunities through creative digital efforts.',
        3,
        'REGION_8',
        ARRAY[2021, 2010, 2009],
        '{"2021": "3rd place", "2010": "1st place", "2009": "2nd place"}'::jsonb
      ),
      (
        'IEEE Student Enterprise Award',
        'Provides financial help to Student members who are looking to implement an idea for a project of technical or non-technical nature.',
        3,
        'GLOBAL',
        ARRAY[2013, 2012, 2009],
        '{}'::jsonb
      ),
      (
        'IEEE International Student Branch Website Contest',
        'Recognizes student websites globally that provide information about activities and learning opportunities through creative digital efforts.',
        2,
        'GLOBAL',
        ARRAY[2010, 2009],
        '{"2010": "1st place", "2009": "3rd place"}'::jsonb
      ),
      (
        'Outstanding Student Branch Membership Growth Award',
        'Recognizes IEEE Student Branches that have demonstrated exceptional success in expanding their member base and fostering an active community.',
        1,
        'GLOBAL',
        ARRAY[2025],
        '{}'::jsonb
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "awards" DROP COLUMN "details"`);
    await queryRunner.query(`ALTER TABLE "awards" DROP COLUMN "years"`);
    await queryRunner.query(`ALTER TABLE "awards" ADD COLUMN "year" integer NOT NULL DEFAULT 2025`);
  }
}
