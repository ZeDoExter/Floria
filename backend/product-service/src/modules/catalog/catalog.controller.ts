import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CreateOptionGroupDto } from './dto/create-option-group.dto.js';
import { UpdateOptionGroupDto } from './dto/update-option-group.dto.js';
import { CreateOptionDto } from './dto/create-option.dto.js';
import { UpdateOptionDto } from './dto/update-option.dto.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  listCategories() {
    return this.catalog.listCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalog.createCategory(dto);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.catalog.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.catalog.removeCategory(id);
  }

  @Get('products')
  listProducts() {
    return this.catalog.listProducts();
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalog.getProduct(id);
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalog.createProduct(dto);
  }

  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalog.updateProduct(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.catalog.deleteProduct(id);
  }

  @Post('option-groups')
  createOptionGroup(@Body() dto: CreateOptionGroupDto) {
    return this.catalog.createOptionGroup(dto);
  }

  @Put('option-groups/:id')
  updateOptionGroup(@Param('id') id: string, @Body() dto: UpdateOptionGroupDto) {
    return this.catalog.updateOptionGroup(id, dto);
  }

  @Delete('option-groups/:id')
  deleteOptionGroup(@Param('id') id: string) {
    return this.catalog.deleteOptionGroup(id);
  }

  @Post('options')
  createOption(@Body() dto: CreateOptionDto) {
    return this.catalog.createOption(dto);
  }

  @Put('options/:id')
  updateOption(@Param('id') id: string, @Body() dto: UpdateOptionDto) {
    return this.catalog.updateOption(id, dto);
  }

  @Delete('options/:id')
  deleteOption(@Param('id') id: string) {
    return this.catalog.deleteOption(id);
  }
}
