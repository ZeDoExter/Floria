import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Relation
} from 'typeorm';
import { Account } from './account.entity';
import { Cart } from './cart.entity';
import { Order } from './order.entity';


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true, unique: true })
  accountId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Account, (account: Account) => account.user, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account!: Relation<Account>;

  @OneToMany(() => Cart, (cart: Cart) => cart.user)
  carts!: Relation<Cart>[];

  @OneToMany(() => Order, (order: Order) => order.user)
  orders!: Relation<Order>[];


}

