import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { CreateOptionDto } from './dto/create-option.dto.js';
import { UpdateOptionDto } from './dto/update-option.dto.js';
import { OptionOwnerGuard } from '../../common/guards/option-owner.guard.js';

@Controller('options')
export class OptionsController {
  constructor(private readonly catalog: CatalogService) { }

  @Post()
  create(@Body() dto: CreateOptionDto) {
    return this.catalog.createOption(dto);
  }

  @Put(':id')
  @UseGuards(OptionOwnerGuard)
  update(@Param('id') id: string, @Body() dto: UpdateOptionDto) {
    return this.catalog.updateOption(id, dto);
  }

  @Delete(':id')
  @UseGuards(OptionOwnerGuard)
  remove(@Param('id') id: string) {
    return this.catalog.deleteOption(id);
  }
}
