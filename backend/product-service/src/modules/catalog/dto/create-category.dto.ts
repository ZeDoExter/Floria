import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
  // ownerId จะถูกเติมจาก JWT token ของ user อัตโนมัติ
}
