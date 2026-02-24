import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateOptionGroupDto {
  @IsString()
  productId!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  isRequired!: boolean;

  @IsInt()
  @Min(0)
  minSelect!: number;

  @IsInt()
  @Min(0)
  maxSelect!: number;
}
