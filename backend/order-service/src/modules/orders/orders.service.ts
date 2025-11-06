import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(cognitoUserId: string | undefined) {
    if (!cognitoUserId) {
      throw new UnauthorizedException('User authentication required');
    }

    const orders = await this.prisma.order.findMany({
      where: { cognito_user_id: cognitoUserId },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    return {
      orders: orders.map((order) => ({
        id: order.id,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt,
        notes: order.notes,
        deliveryDate: order.deliveryDate
      }))
    };
  }

  private async calculateItem(productId: string, optionIds: string[]) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        optionGroups: {
          include: { options: true }
        }
      }
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const basePrice = new Prisma.Decimal(product.basePrice);
    const selectedOptions = product.optionGroups.flatMap((group) => group.options).filter((option) =>
      optionIds.includes(option.id)
    );
    const modifiers = selectedOptions.reduce(
      (total, option) => total.add(option.priceModifier),
      new Prisma.Decimal(0)
    );
    const unitPrice = basePrice.add(modifiers);

    return {
      product,
      selectedOptions,
      unitPrice
    };
  }

  async createOrder(cognitoUserId: string | undefined, dto: CreateOrderDto) {
    if (!cognitoUserId) {
      throw new UnauthorizedException('User authentication required');
    }

    const orderItems = [] as {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      optionSnapshot: unknown;
    }[];

    let total = new Prisma.Decimal(0);

    for (const item of dto.items) {
      const { product, selectedOptions, unitPrice } = await this.calculateItem(
        item.productId,
        item.selectedOptionIds
      );
      const lineTotal = unitPrice.mul(item.quantity);
      total = total.add(lineTotal);
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        optionSnapshot: {
          selectedOptionIds: item.selectedOptionIds,
          selectedOptions: selectedOptions.map((option) => ({
            id: option.id,
            name: option.name,
            priceModifier: Number(option.priceModifier)
          }))
        }
      });
    }

    const order = await this.prisma.order.create({
      data: {
        cognito_user_id: cognitoUserId,
        totalAmount: total,
        status: 'PLACED',
        notes: dto.notes,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            optionSnapshot: item.optionSnapshot
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Clear cart after successful order
    await this.prisma.cartItem
      .deleteMany({
        where: {
          cart: {
            cognito_user_id: cognitoUserId
          }
        }
      })
      .catch(() => undefined);

    return {
      order: {
        id: order.id,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt,
        notes: order.notes,
        deliveryDate: order.deliveryDate
      }
    };
  }
}
