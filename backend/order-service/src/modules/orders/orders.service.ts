import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Decimal } from '@prisma/client/runtime/library';
import type {
  CalculatedProductPricing,
  OrderWithItems,
  PreparedOrderItem,
  ProductOption,
  ProductWithOptionGroups,
  SerializedOrderDetail,
  SerializedOrderList
} from './orders.types.js';
import { decodeLocalUserEmail, getUserRole } from './roles.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(cognitoUserId: string | undefined, userEmail: string | undefined): Promise<SerializedOrderList> {
    const role = getUserRole(userEmail);

    if (!cognitoUserId && role !== 'owner') {
      throw new UnauthorizedException('User authentication required');
    }

    const where = role === 'owner' ? undefined : { cognito_user_id: cognitoUserId };

    const orders: OrderWithItems[] = await this.prisma.order.findMany({
      where,
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
        deliveryDate: order.deliveryDate,
        customerId: role === 'owner' ? order.cognito_user_id : undefined,
        customerEmail: role === 'owner' ? decodeLocalUserEmail(order.cognito_user_id) : undefined
      }))
    };
  }

  private async calculateItem(productId: string, optionIds: string[]): Promise<CalculatedProductPricing> {
    const product = (await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        optionGroups: {
          include: { options: true }
        }
      }
    })) as ProductWithOptionGroups | null;

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const basePrice = new Decimal(product.basePrice);
    const selectedOptions: ProductOption[] = product.optionGroups
      .flatMap((group) => group.options)
      .filter((option): option is ProductOption => optionIds.includes(option.id));
    const modifiers = selectedOptions.reduce<Decimal>(
      (total, option) => total.add(option.priceModifier),
      new Decimal(0)
    );
    const unitPrice = basePrice.add(modifiers);

    return {
      product,
      selectedOptions,
      unitPrice
    };
  }

  async createOrder(cognitoUserId: string | undefined, dto: CreateOrderDto): Promise<SerializedOrderDetail> {
    if (!cognitoUserId) {
      throw new UnauthorizedException('User authentication required');
    }

    const orderItems: PreparedOrderItem[] = [];

    let total = new Decimal(0);

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
