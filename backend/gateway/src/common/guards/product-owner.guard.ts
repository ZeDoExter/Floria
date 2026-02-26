import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity.js';

@Injectable()
export class ProductOwnerGuard implements CanActivate {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        const productId = request.params.id;

        if (!userId || !productId) {
            throw new ForbiddenException('Unauthorized');
        }

        const product = await this.productRepository.findOne({
            where: { id: productId, ownerId: userId }
        });

        if (!product) {
            throw new ForbiddenException('You do not have permission to manage this product');
        }

        return true;
    }
}
