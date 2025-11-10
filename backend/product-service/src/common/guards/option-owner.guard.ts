import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Option } from '../../entities/option.entity';

@Injectable()
export class OptionOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const optionId = request.params.id;

    if (!userId || !optionId) {
      throw new ForbiddenException('Unauthorized');
    }

    const option = await this.optionRepository.findOne({
      where: { id: optionId },
      relations: ['optionGroup', 'optionGroup.product']
    });

    if (!option || option.optionGroup.product.ownerId !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์จัดการตัวเลือกนี้');
    }

    return true;
  }
}
