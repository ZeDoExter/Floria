import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CreateOptionGroupDto } from './dto/create-option-group.dto.js';
import { UpdateOptionGroupDto } from './dto/update-option-group.dto.js';
import { CreateOptionDto } from './dto/create-option.dto.js';
import { UpdateOptionDto } from './dto/update-option.dto.js';
import { Category } from '../../entities/category.entity.js';
import { Product } from '../../entities/product.entity.js';
import { OptionGroup } from '../../entities/option-group.entity.js';
import { Option } from '../../entities/option.entity.js';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OptionGroup)
    private readonly optionGroupRepository: Repository<OptionGroup>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>
  ) {}

  listCategories(userId?: string) {
    // ถ้ามี userId = แสดงเฉพาะของ user นั้น (สำหรับ owner dashboard)
    // ถ้าไม่มี userId = แสดงทั้งหมด (สำหรับ customer/public)
    const where = userId ? { ownerId: userId } : {};
    return this.categoryRepository.find({
      where,
      order: { name: 'ASC' }
    });
  }

  async createCategory(dto: CreateCategoryDto, userId: string) {
    const category = this.categoryRepository.create({
      ...dto,
      ownerId: userId // ใช้ userId เป็น ownerId เลย (1 user = 1 ร้าน)
    });
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, userId: string) {
    // เช็คว่า category นี้เป็นของ user คนนี้จริงๆ
    const category = await this.categoryRepository.findOne({
      where: { id, ownerId: userId }
    });

    if (!category) {
      throw new NotFoundException('ไม่พบหมวดหมู่นี้หรือคุณไม่มีสิทธิ์แก้ไข');
    }

    await this.categoryRepository.update(id, dto);
    return this.categoryRepository.findOne({ where: { id } });
  }

  async removeCategory(id: string) {
    return this.categoryRepository.delete(id);
  }

  listProducts(userId?: string) {
    // ถ้ามี userId = แสดงเฉพาะของ user นั้น (สำหรับ owner dashboard)
    // ถ้าไม่มี userId = แสดงทั้งหมด (สำหรับ customer/public)
    const where = userId ? { ownerId: userId } : {};
    return this.productRepository.find({
      where,
      relations: ['category', 'optionGroups', 'optionGroups.options'],
      order: { createdAt: 'DESC' }
    });
  }

  async getProduct(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'optionGroups', 'optionGroups.options']
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  createProduct(dto: CreateProductDto, userId: string) {
    const product = this.productRepository.create({
      ...dto,
      ownerId: userId
    });
    return this.productRepository.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.productRepository.update(id, dto);
    return this.productRepository.findOne({
      where: { id },
      relations: ['category', 'optionGroups', 'optionGroups.options']
    });
  }

  deleteProduct(id: string) {
    return this.productRepository.delete(id);
  }

  createOptionGroup(dto: CreateOptionGroupDto) {
    const optionGroup = this.optionGroupRepository.create(dto);
    return this.optionGroupRepository.save(optionGroup);
  }

  async updateOptionGroup(id: string, dto: UpdateOptionGroupDto) {
    await this.optionGroupRepository.update(id, dto);
    return this.optionGroupRepository.findOne({ where: { id } });
  }

  deleteOptionGroup(id: string) {
    return this.optionGroupRepository.delete(id);
  }

  createOption(dto: CreateOptionDto) {
    const option = this.optionRepository.create(dto);
    return this.optionRepository.save(option);
  }

  async updateOption(id: string, dto: UpdateOptionDto) {
    await this.optionRepository.update(id, dto);
    return this.optionRepository.findOne({ where: { id } });
  }

  deleteOption(id: string) {
    return this.optionRepository.delete(id);
  }
}
