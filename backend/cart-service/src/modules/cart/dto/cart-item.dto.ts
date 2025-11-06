import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsArray()
  @IsString({ each: true })
  selectedOptionIds!: string[];
}

export class AddItemDto extends CartItemDto {
  @IsOptional()
  @IsString()
  anonymousId?: string;
}

export class UpdateItemDto {
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  anonymousId?: string;
}

export class MergeCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[];

  @IsOptional()
  @IsString()
  anonymousId?: string;
}
