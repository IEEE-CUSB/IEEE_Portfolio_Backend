import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCommitteesStructure1789818000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Clear existing board, committees, categories (COMMITTEE type only)
    await queryRunner.query(`DELETE FROM "board"`);
    await queryRunner.query(`DELETE FROM "categories" WHERE type = 'COMMITTEE'`);

    // 2. Insert Board Members
    await queryRunner.query(`
      INSERT INTO "board" (name, role, email, image_url, display_order) VALUES
      ('Abdullah Hatem', 'Chairman', '', '', 1),
      ('Mohammed Ahmed', 'Vice Chairman', '', '', 2),
      ('Mohammed Yasir', 'Secretary', '', '', 3),
      ('TBD', 'Treasurer', '', '', 4),
      ('Islam Essam', 'Web Master', '', '', 5)
    `);

    // 3. Insert Categories and Committees
    const categories = [
      {
        name: 'Technical Section',
        committees: ['Electronics', 'Embedded Systems', 'AI & Data Analysis', 'Cybersecurity', 'Power', 'Robotics']
      },
      {
        name: 'Branding Section',
        committees: ['Marketing', 'Multimedia', 'Podcast', 'Magazine']
      },
      {
        name: 'IT Section',
        committees: ['Web', 'Mobile']
      },
      {
        name: 'Quality Control Section',
        committees: ['HR', 'T&D']
      },
      {
        name: 'Board of Advisors (BOA)',
        committees: []
      }
    ];

    for (const cat of categories) {
      const res = await queryRunner.query(`
        INSERT INTO "categories" (name, type) VALUES ($1, 'COMMITTEE') RETURNING id
      `, [cat.name]);
      const catId = res[0].id;

      for (const com of cat.committees) {
        await queryRunner.query(`
          INSERT INTO "committees" (name, about, category_id) VALUES ($1, $2, $3)
        `, [com, 'TBD', catId]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "board"`);
    await queryRunner.query(`DELETE FROM "categories" WHERE type = 'COMMITTEE'`);
  }
}
