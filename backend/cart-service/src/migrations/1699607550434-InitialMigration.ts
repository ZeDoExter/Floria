import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1699607550434 implements MigrationInterface {
  name = 'InitialMigration1699607550434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Shop table
    await queryRunner.query(`
      CREATE TABLE "shop" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ownerUserId" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ad47b7c6121fe31436338e99551" PRIMARY KEY ("id")
      )
    `);

    // Create Category table with shop reference
    await queryRunner.query(`
      CREATE TABLE "category" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "shopId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"),
        CONSTRAINT "FK_category_shop" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE
      )
    `);

    // Create Product table with category and shop references
    await queryRunner.query(`
      CREATE TABLE "product" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "basePrice" decimal(10,2) NOT NULL,
        "imageUrl" character varying,
        "categoryId" uuid NOT NULL,
        "shopId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_shop" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE
      )
    `);

    // Create OptionGroup table with product reference
    await queryRunner.query(`
      CREATE TABLE "option_group" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "isRequired" boolean NOT NULL DEFAULT false,
        "minSelect" integer NOT NULL DEFAULT 0,
        "maxSelect" integer NOT NULL DEFAULT 0,
        "productId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_6dd0ba138d5052316ab98ec5e59" PRIMARY KEY ("id"),
        CONSTRAINT "FK_optiongroup_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE
      )
    `);

    // Create Option table with option group reference
    await queryRunner.query(`
      CREATE TABLE "option" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "priceModifier" decimal(10,2) NOT NULL,
        "optionGroupId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_e6090c1c6ad8962ebc97ef7e872" PRIMARY KEY ("id"),
        CONSTRAINT "FK_option_optiongroup" FOREIGN KEY ("optionGroupId") REFERENCES "option_group"("id") ON DELETE CASCADE
      )
    `);

    // Create Cart table
    await queryRunner.query(`
      CREATE TABLE "cart" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "cognitoUserId" character varying,
        "anonymousId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cart_cognito_user" UNIQUE ("cognitoUserId"),
        CONSTRAINT "UQ_cart_anonymous" UNIQUE ("anonymousId")
      )
    `);

    // Create CartItem table with cart and product references
    await queryRunner.query(`
      CREATE TABLE "cart_item" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "cartId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "selectedOptionIds" text[] NOT NULL DEFAULT array[]::text[],
        "unitPrice" decimal(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bd94725aa84f8cf37632bcde997" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cartitem_cart" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cartitem_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE
      )
    `);

    // Create Order table
    await queryRunner.query(`
      CREATE TABLE "order" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "cognitoUserId" character varying NOT NULL,
        "totalAmount" decimal(10,2) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "notes" character varying,
        "deliveryDate" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")
      )
    `);

    // Create OrderItem table with order and product references
    await queryRunner.query(`
      CREATE TABLE "order_item" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "productName" character varying NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" decimal(10,2) NOT NULL,
        "optionSnapshot" jsonb NOT NULL,
        CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orderitem_order" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_orderitem_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TABLE "cart_item"`);
    await queryRunner.query(`DROP TABLE "cart"`);
    await queryRunner.query(`DROP TABLE "option"`);
    await queryRunner.query(`DROP TABLE "option_group"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "shop"`);
  }
}