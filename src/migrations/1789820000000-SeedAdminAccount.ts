import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdminAccount1789820000000 implements MigrationInterface {
  name = 'SeedAdminAccount1789820000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const roleRes = await queryRunner.query(`SELECT id FROM roles WHERE name='Super Admin' LIMIT 1`);
    if (roleRes.length > 0) {
      const roleId = roleRes[0].id;
      // Check if admin already exists
      const existing = await queryRunner.query(`SELECT id FROM users WHERE username='admin' OR email='admin@ieeecusb.org' LIMIT 1`);
      
      if (existing.length === 0) {
        // Use bcrypt hash for "IEEE@cusb_IT&head$"
        const hash = "$2b$10$FHoK4HWvTqQSrcIh470YsOBpcpqIA3IgnSV9t5GIRo40o93ylAFbO";
        await queryRunner.query(
          `INSERT INTO "users" (name, username, email, password, role_id, faculty, university, academic_year, is_active) 
           VALUES ('Super Admin', 'admin', 'admin@ieeecusb.org', $1, $2, 'Engineering', 'CUSB', 2026, true)`,
          [hash, roleId]
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE email='admin@ieeecusb.org'`);
  }
}
