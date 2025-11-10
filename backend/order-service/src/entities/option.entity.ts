import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn,
  Relation, JoinColumn
} from 'typeorm';

import { OptionGroup } from './option-group.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({type: 'text', nullable: true })
  description!: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  priceModifier!: number;

  @Column({ type: 'uuid', name: 'optionGroupId' })
  optionGroupId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => OptionGroup, (group) => group.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'optionGroupId' })
  optionGroup!: Relation<OptionGroup>;
}

