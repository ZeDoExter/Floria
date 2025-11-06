import { PartialType } from '@nestjs/mapped-types';
import { CreateOptionGroupDto } from './create-option-group.dto.js';

export class UpdateOptionGroupDto extends PartialType(CreateOptionGroupDto) {}
