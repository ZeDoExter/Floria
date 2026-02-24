import { PartialType } from '@nestjs/mapped-types';
import { CreateOptionDto } from './create-option.dto.js';

export class UpdateOptionDto extends PartialType(CreateOptionDto) {}
