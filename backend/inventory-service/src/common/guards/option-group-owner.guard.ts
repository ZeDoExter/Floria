import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptionGroup } from '../../entities/option-group.entity';

@Injectable()
export class OptionGroupOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(OptionGroup)
    private readonly optionGroupRepository: Repository<OptionGroup>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const optionGroupId = request.params.id;

    if (!userId || !optionGroupId) {
      throw new ForbiddenException('Unauthorized');
    }

    const optionGroup = await this.optionGroupRepository.findOne({
      where: { id: optionGroupId },
      relations: ['product']
    });

    if (!optionGroup || optionGroup.product.ownerId !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์จัดการกลุ่มตัวเลือกนี้');
    }

    return true;
  }
}
