import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation, JoinColumn
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'orderId' })
  orderId!: string;

  @Column({ type: 'uuid', name: 'productId' })
  productId!: string;

  @Column({ type: 'varchar' })
  productName!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;

  @Column('jsonb')
  optionSnapshot!: Record<string, any>;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Relation<Order>;

  @ManyToOne(() => Product, (product) => product.orderItems, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'productId' })
  product!: Relation<Product>;
}
