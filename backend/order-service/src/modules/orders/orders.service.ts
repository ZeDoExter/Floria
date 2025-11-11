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

  async listMyOrders(userId: string | undefined): Promise<SerializedOrderList> {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return orders that this user placed
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
        deliveryDate: order.deliveryDate,
        items: order.items?.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          optionSnapshot: item.optionSnapshot
        })) || []
      }))
    };
  }

  async listCustomerOrders(userId: string | undefined, userEmail: string | undefined): Promise<SerializedOrderList> {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Owner sees orders containing their products
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoin('items.product', 'product')
      .leftJoin('order.user', 'orderUser')
      .where('product.ownerId = :ownerId', { ownerId: user.id })
      .orderBy('order.createdAt', 'DESC')
      .addSelect(['orderUser.email'])
      .getMany();

    return {
      orders: orders.map((order: Order) => ({
        id: order.id,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt,
        notes: order.notes,
        deliveryDate: order.deliveryDate,
        customerEmail: order.user?.email || userEmail
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

  async updateOrderStatus(
    userId: string | undefined, 
    userEmail: string | undefined, 
    userRole: string | undefined,
    orderId: string, 
    status: OrderStatus
  ): Promise<{ id: string; status: OrderStatus }> {
    try {
      console.log('=== Update Order Status Debug ===');
      console.log('userId:', userId);
      console.log('userEmail:', userEmail);
      console.log('userRole:', userRole);
      console.log('orderId:', orderId);
      
      if (!userId || !userEmail) {
        throw new UnauthorizedException('User authentication required');
      }

      // Check if order exists
      const order = await this.orderRepository.findOne({
        where: { id: orderId }
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      console.log('order.userId:', order.userId);
      console.log('userRole:', userRole);
      

      const isOrderOwner = order.userId === userId;
      const isShopOwner = userRole === 'owner';

      console.log('isOrderOwner:', isOrderOwner);
      console.log('isShopOwner:', isShopOwner);

      // Update the order status
      await this.orderRepository.update(orderId, { status });

      return {
        id: orderId,
        status
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

}
