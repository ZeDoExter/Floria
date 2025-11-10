import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne,
  Relation, JoinColumn
} from 'typeorm';
import { Option } from './option.entity';
import { Product } from './product.entity';

@Entity()
export class OptionGroup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean' })
  isRequired!: boolean;

  @Column({ type: 'int' })
  minSelect!: number;

  @Column({ type: 'int' })
  maxSelect!: number;

  @Column({ type: 'uuid', name: 'productId' })
  productId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Product, (product) => product.optionGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Relation<Product>;

  @OneToMany(() => Option, (opt) => opt.optionGroup, { cascade: true })
  options!: Relation<Option>[];
}

