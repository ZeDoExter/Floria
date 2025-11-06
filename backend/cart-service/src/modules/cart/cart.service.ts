import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AddItemDto, CartItemDto, MergeCartDto, UpdateItemDto } from './dto/cart-item.dto.js';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';
import type { CartWithItemsAndProduct, SerializedCart } from './cart.types.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureCartForUser(cognitoUserId: string) {
    const cart = await this.prisma.cart.upsert({
      where: { cognito_user_id: cognitoUserId },
      update: {},
      create: { cognito_user_id: cognitoUserId }
    });
    return cart;
  }

  private async ensureCartForAnonymous(anonymousId: string) {
    const cart = await this.prisma.cart.upsert({
      where: { anonymousId },
      update: {},
      create: { anonymousId }
    });
    return cart;
  }

  private async calculateUnitPrice(productId: string, optionIds: string[]): Promise<Decimal> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        optionGroups: {
          include: { options: true }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const basePrice = new Decimal(product.basePrice);
    const modifiers = optionIds.reduce<Decimal>((total, optionId) => {
      const option = product.optionGroups
        .flatMap((group: { options: any; }) => group.options)
        .find((opt: { id: string; }) => opt.id === optionId);
      if (!option) {
        return total;
      }
      return total.add(option.priceModifier);
    }, new Decimal(0));

    return basePrice.add(modifiers);
  }

  private serializeCart(cart: CartWithItemsAndProduct | null): SerializedCart {
    if (!cart) {
      return { items: [] };
    }

    return {
      id: cart.id,
      cognito_user_id: cart.cognito_user_id,
      anonymousId: cart.anonymousId,
      items: cart.items.map((item: { id: any; productId: any; product: { name: any; }; quantity: any; selectedOptionIds: any; unitPrice: any; }) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        selectedOptionIds: item.selectedOptionIds,
        unitPrice: Number(item.unitPrice)
      }))
    };
  }

  private getCartById(cartId: string): Promise<CartWithItemsAndProduct | null> {
    return this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  private getCartForUserId(cognitoUserId: string): Promise<CartWithItemsAndProduct | null> {
    return this.prisma.cart.findFirst({
      where: { cognito_user_id: cognitoUserId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }

  private getCartForAnonymousId(anonymousId: string): Promise<CartWithItemsAndProduct | null> {
    return this.prisma.cart.findFirst({
      where: { anonymousId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }

  async getCart(cognitoUserId?: string, anonymousId?: string): Promise<SerializedCart> {
    let cart = null;
    if (cognitoUserId) {
      cart = await this.getCartForUserId(cognitoUserId);
    }
    if (!cart && anonymousId) {
      cart = await this.getCartForAnonymousId(anonymousId);
    }
    if (!cart) {
      return { items: [] };
    }
    return this.serializeCart(cart);
  }

  async mergeCart(cognitoUserId: string | undefined, payload: MergeCartDto): Promise<SerializedCart> {
    if (!cognitoUserId) {
      throw new UnauthorizedException('User authentication is required to merge carts');
    }

    const targetCart = await this.ensureCartForUser(cognitoUserId);
    const itemsToMerge: CartItemDto[] = [...payload.items];

    if (payload.anonymousId) {
      const anonymousCart = await this.getCartForAnonymousId(payload.anonymousId);
      if (anonymousCart) {
        for (const item of anonymousCart.items) {
          itemsToMerge.push({
            productId: item.productId,
            quantity: item.quantity,
            selectedOptionIds: item.selectedOptionIds
          });
        }
        await this.prisma.cart.delete({ where: { id: anonymousCart.id } });
      }
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: targetCart.id } });

    for (const item of itemsToMerge) {
      const unitPrice = await this.calculateUnitPrice(item.productId, item.selectedOptionIds);
      await this.prisma.cartItem.create({
        data: {
          cartId: targetCart.id,
          productId: item.productId,
          quantity: item.quantity,
          selectedOptionIds: item.selectedOptionIds,
          unitPrice
        }
      });
    }

    const updatedCart = await this.getCartById(targetCart.id);
    return this.serializeCart(updatedCart);
  }

  async addItem(
    cognitoUserId: string | undefined,
    anonymousId: string | undefined,
    payload: AddItemDto
  ): Promise<SerializedCart> {
    const targetAnonymousId = payload.anonymousId ?? anonymousId;
    const cart = cognitoUserId
      ? await this.ensureCartForUser(cognitoUserId)
      : await this.ensureCartForAnonymous(targetAnonymousId ?? randomUUID());

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: payload.productId
      }
    });

    const unitPrice = await this.calculateUnitPrice(payload.productId, payload.selectedOptionIds);

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + payload.quantity,
          selectedOptionIds: payload.selectedOptionIds,
          unitPrice
        }
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: payload.productId,
          quantity: payload.quantity,
          selectedOptionIds: payload.selectedOptionIds,
          unitPrice
        }
      });
    }

    const updatedCart = await this.getCartById(cart.id);
    return this.serializeCart(updatedCart);
  }

  async updateItem(
    cognitoUserId: string | undefined,
    anonymousId: string | undefined,
    itemId: string,
    payload: UpdateItemDto
  ): Promise<SerializedCart> {
    const activeAnonymousId = payload.anonymousId ?? anonymousId;
    const cart = cognitoUserId
      ? await this.getCartForUserId(cognitoUserId)
      : activeAnonymousId
      ? await this.getCartForAnonymousId(activeAnonymousId)
      : null;

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find((cartItem: { id: string; }) => cartItem.id === itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: payload.quantity }
    });

    const updatedCart = await this.getCartById(cart.id);
    return this.serializeCart(updatedCart);
  }

  async removeItem(
    cognitoUserId: string | undefined,
    anonymousId: string | undefined,
    itemId: string
  ): Promise<SerializedCart> {
    const cart = cognitoUserId
      ? await this.getCartForUserId(cognitoUserId)
      : anonymousId
      ? await this.getCartForAnonymousId(anonymousId)
      : null;

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find((cartItem: { id: string; }) => cartItem.id === itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    const updatedCart = await this.getCartById(cart.id);
    return this.serializeCart(updatedCart);
  }
}
