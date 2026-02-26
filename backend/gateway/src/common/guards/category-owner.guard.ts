import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity.js';

@Injectable()
export class CategoryOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const categoryId = request.params.id;

    if (!userId || !categoryId) {
      throw new ForbiddenException('Unauthorized');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, ownerId: userId }
    });

    if (!category) {
      throw new ForbiddenException('You do not have permission to manage this category');
    }

    return true;
  }
}
