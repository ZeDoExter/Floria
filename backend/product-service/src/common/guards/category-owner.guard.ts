import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';

@Injectable()
export class CategoryOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id']; // จาก gateway
    const categoryId = request.params.id;

    if (!userId || !categoryId) {
      throw new ForbiddenException('Unauthorized');
    }

    // เช็คว่า category นี้เป็นของ user คนนี้จริงๆ
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        ownerId: userId
      }
    });

    if (!category) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์จัดการหมวดหมู่นี้');
    }

    return true;
  }
}