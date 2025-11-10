import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Relation, JoinColumn } from 'typeorm';
import { Category } from './category.entity';

import { OrderItem } from './order-item.entity';
import { CartItem } from './cart-item.entity';
import { OptionGroup } from './option-group.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice!: number;

  @Column({ type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'uuid' })
  ownerId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Category, (category: Category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category!: Relation<Category>;



  @OneToMany(() => OptionGroup, (optionGroup: OptionGroup) => optionGroup.product)
  optionGroups!: Relation<OptionGroup>[];

  @OneToMany(() => OrderItem, (item: OrderItem) => item.product)
  orderItems!: Relation<OrderItem>[];

  @OneToMany(() => CartItem, (cartItem: CartItem) => cartItem.product)
  cartItems!: Relation<CartItem>[];
}