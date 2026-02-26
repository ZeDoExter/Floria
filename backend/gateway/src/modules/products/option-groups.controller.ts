import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { CreateOptionGroupDto } from './dto/create-option-group.dto.js';
import { UpdateOptionGroupDto } from './dto/update-option-group.dto.js';
import { OptionGroupOwnerGuard } from '../../common/guards/option-group-owner.guard.js';

@Controller('option-groups')
export class OptionGroupsController {
  constructor(private readonly catalog: CatalogService) { }

  @Post()
  create(@Body() dto: CreateOptionGroupDto) {
    return this.catalog.createOptionGroup(dto);
  }

  @Put(':id')
  @UseGuards(OptionGroupOwnerGuard)
  update(@Param('id') id: string, @Body() dto: UpdateOptionGroupDto) {
    return this.catalog.updateOptionGroup(id, dto);
  }

  @Delete(':id')
  @UseGuards(OptionGroupOwnerGuard)
  remove(@Param('id') id: string) {
    return this.catalog.deleteOptionGroup(id);
  }
}
