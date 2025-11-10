import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveShopAndUpdateOwner1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // เปลี่ยน shopId เป็น ownerId ใน category
    await queryRunner.query(`
      ALTER TABLE "category"
      DROP CONSTRAINT IF EXISTS "FK_category_shop",
      DROP COLUMN "shopId",
      ADD COLUMN "ownerId" uuid NOT NULL,
      ADD CONSTRAINT "FK_category_owner"
      FOREIGN KEY ("ownerId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
    `);

    // เปลี่ยน shopId เป็น ownerId ใน product
    await queryRunner.query(`
      ALTER TABLE "product"
      DROP CONSTRAINT IF EXISTS "FK_product_shop",
      DROP COLUMN "shopId",
      DROP COLUMN "storeKey",
      ADD COLUMN "ownerId" uuid NOT NULL,
      ADD CONSTRAINT "FK_product_owner"
      FOREIGN KEY ("ownerId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback ถ้าต้องการ
    await queryRunner.query(`
      ALTER TABLE "product"
      DROP CONSTRAINT "FK_product_owner",
      DROP COLUMN "ownerId"
    `);

    await queryRunner.query(`
      ALTER TABLE "category"
      DROP CONSTRAINT "FK_category_owner",
      DROP COLUMN "ownerId"
    `);
  }
}
