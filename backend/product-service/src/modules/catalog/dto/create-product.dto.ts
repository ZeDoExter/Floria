import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export const STORE_KEYS = ['flagship', 'weekend-market'] as const;
export type StoreKey = (typeof STORE_KEYS)[number];

export class CreateProductDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  basePrice!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNotEmpty()
  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  @IsIn([...STORE_KEYS])
  storeKey?: StoreKey;
}
