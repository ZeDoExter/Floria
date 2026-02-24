import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeys1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // เพิ่ม FK ระหว่าง Cart -> User
    await queryRunner.query(`
      ALTER TABLE "cart"
      ADD CONSTRAINT "FK_cart_user"
      FOREIGN KEY ("userId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
    `);

    // เพิ่ม FK ระหว่าง Shop -> User (owner)
    await queryRunner.query(`
      ALTER TABLE "shop"
      ADD CONSTRAINT "FK_shop_owner"
      FOREIGN KEY ("ownerUserId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
    `);

    // เพิ่ม FK ระหว่าง Category -> Shop
    await queryRunner.query(`
      ALTER TABLE "category"
      ADD CONSTRAINT "FK_category_shop"
      FOREIGN KEY ("shopId")
      REFERENCES "shop"("id")
      ON DELETE CASCADE
    `);

    // เพิ่ม FK ระหว่าง Product -> Shop
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD CONSTRAINT "FK_product_shop"
      FOREIGN KEY ("shopId")
      REFERENCES "shop"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ลบ FK ทั้งหมดถ้าต้องการ rollback
    await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_cart_user"`);
    await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_shop_owner"`);
    await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_category_shop"`);
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_shop"`);
  }
}