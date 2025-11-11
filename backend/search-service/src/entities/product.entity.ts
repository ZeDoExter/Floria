import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Category } from './category.entity.js';

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

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category!: Relation<Category>;

  @Column({ type: 'uuid' })
  ownerId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

