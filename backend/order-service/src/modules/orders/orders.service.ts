import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto.js';
import type {
  CalculatedProductPricing,
  OrderStatus,
  PreparedOrderItem,
  ProductOption,
  ProductWithOptionGroups,
  SerializedOrderDetail,
  SerializedOrderList
} from './orders.types.js';

import { Order } from '../../entities/order.entity.js';
import { OrderItem } from '../../entities/order-item.entity.js';
import { Product } from '../../entities/product.entity.js';
import { OptionGroup } from '../../entities/option-group.entity.js';
import { Option } from '../../entities/option.entity.js';
import { CartItem } from '../../entities/cart-item.entity.js';
import { Cart } from '../../entities/cart.entity.js';
import { User } from '../../entities/user.entity.js';
import { getUserRole } from './roles.js';

type OrderWithUser = Order & { user?: User };

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async listOrders(userId: string | undefined, userEmail: string | undefined): Promise<SerializedOrderList> {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orders = await this.orderRepository.find({
      where: { userId: user.id },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });

    return {
      orders: orders.map((order: Order) => ({
        id: order.id,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt,
        notes: order.notes,
        deliveryDate: order.deliveryDate
      }))
    };
  }

  private async calculateItem(productId: string, optionIds: string[]): Promise<CalculatedProductPricing> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['optionGroups', 'optionGroups.options']
    });

    if (!product || !product.optionGroups) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const basePrice = Number(product.basePrice);
    const allOptions: Option[] = [];
    for (const group of product.optionGroups) {
      if (group.options) {
        allOptions.push(...group.options);
      }
    }

    const selectedOptions: ProductOption[] = allOptions
      .filter((option: Option) => optionIds.includes(option.id))
      .map((option: Option) => ({
        id: option.id,
        name: option.name,
        priceModifier: Number(option.priceModifier)
      }));

    const modifiers = selectedOptions.reduce(
      (total, option) => total + option.priceModifier,
      0
    );
    const unitPrice = basePrice + modifiers;

    return {
      product: {
        id: product.id,
        name: product.name,
        basePrice: Number(product.basePrice),
        optionGroups: product.optionGroups.map((group: OptionGroup) => ({
          id: group.id,
          name: group.name,
          options: (group.options || []).map((opt: Option) => ({
            id: opt.id,
            name: opt.name,
            priceModifier: Number(opt.priceModifier)
          }))
        }))
      },
      selectedOptions,
      unitPrice
    };
  }

  async createOrder(userId: string | undefined, dto: CreateOrderDto): Promise<SerializedOrderDetail> {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const orderItems: PreparedOrderItem[] = [];

    let total = 0;

    for (const item of dto.items) {
      const { product, selectedOptions, unitPrice } = await this.calculateItem(
        item.productId,
        item.selectedOptionIds
      );
      const lineTotal = unitPrice * item.quantity;
      total = total + lineTotal;
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
            priceModifier: option.priceModifier
          }))
        }
      });
    }

    const order = this.orderRepository.create({
      userId: user.id,
      totalAmount: total,
      status: 'PLACED',
      notes: dto.notes,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItemsToCreate = orderItems.map((item) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        optionSnapshot: item.optionSnapshot
      })
    );

    await this.orderItemRepository.save(orderItemsToCreate);

    // Clear cart after successful order
    const cart = await this.cartRepository.findOne({
      where: { userId: user.id },
      relations: ['items']
    });

    if (cart) {
      await this.cartItemRepository.delete({ cartId: cart.id });
    }

    return {
      order: {
        id: savedOrder.id,
        totalAmount: Number(savedOrder.totalAmount),
        status: savedOrder.status,
        createdAt: savedOrder.createdAt,
        notes: savedOrder.notes,
        deliveryDate: savedOrder.deliveryDate
      }
    };
  }

  async updateOrderStatus(userEmail: string | undefined, orderId: string, status: OrderStatus): Promise<void> {
    if (!userEmail) {
      throw new UnauthorizedException('User authentication required');
    }

    const user = await this.userRepository.findOne({
      where: { email: userEmail }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has permission to update order status (e.g., admin or order owner)
    // For now, allow if user is admin or the order belongs to them
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Allow update if user is admin or owns the order
    const userRole = getUserRole(user.email);
    if (userRole !== 'admin' && order.userId !== user.id) {
      throw new UnauthorizedException('You do not have permission to update this order status');
    }

    // Update the order status
    await this.orderRepository.update(orderId, { status });
  }

}
