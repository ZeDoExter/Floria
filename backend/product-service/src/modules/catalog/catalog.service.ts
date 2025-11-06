import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CreateOptionGroupDto } from './dto/create-option-group.dto.js';
import { UpdateOptionGroupDto } from './dto/update-option-group.dto.js';
import { CreateOptionDto } from './dto/create-option.dto.js';
import { UpdateOptionDto } from './dto/update-option.dto.js';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  listProducts() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        optionGroups: {
          include: { options: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        optionGroups: {
          include: { options: true }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  updateProduct(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  deleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  createOptionGroup(dto: CreateOptionGroupDto) {
    return this.prisma.optionGroup.create({ data: dto });
  }

  updateOptionGroup(id: string, dto: UpdateOptionGroupDto) {
    return this.prisma.optionGroup.update({ where: { id }, data: dto });
  }

  deleteOptionGroup(id: string) {
    return this.prisma.optionGroup.delete({ where: { id } });
  }

  createOption(dto: CreateOptionDto) {
    return this.prisma.option.create({ data: dto });
  }

  updateOption(id: string, dto: UpdateOptionDto) {
    return this.prisma.option.update({ where: { id }, data: dto });
  }

  deleteOption(id: string) {
    return this.prisma.option.delete({ where: { id } });
  }
}
