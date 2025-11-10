import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, Relation, JoinColumn } from 'typeorm';
import { Product } from './product.entity';


@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'uuid' })
  ownerId!: string;  // userId ของเจ้าของร้าน (1 user = 1 ร้าน)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;



  @OneToMany(() => Product, (product: Product) => product.category)
  products!: Relation<Product>[];
}
