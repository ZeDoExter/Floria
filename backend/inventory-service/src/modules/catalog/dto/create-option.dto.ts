import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOptionDto {
  @IsString()
  optionGroupId!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  priceModifier!: number;
}
