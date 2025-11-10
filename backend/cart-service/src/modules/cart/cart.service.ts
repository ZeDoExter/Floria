import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddItemDto, CartItemDto, MergeCartDto, UpdateItemDto } from './dto/cart-item.dto.js';
import { randomUUID } from 'crypto';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { Product } from '../../entities/product.entity';
import { Option } from '../../entities/option.entity';
import { User } from '../../entities/user.entity';
import type {
  CartItemWithProduct,
  CartWithItemsAndProduct,
  OptionGroupWithOptions,
  ProductOption,
  ProductWithOptionGroups,
  SerializedCart
} from './cart.types.js';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId }
    });
  }

  private async ensureCartForUser(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: { userId }
    });

    if (!cart) {
      cart = this.cartRepository.create({
        userId
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  private async ensureCartForAnonymous(anonymousId: string) {
    let cart = await this.cartRepository.findOne({
      where: { anonymousId }
    });

    if (!cart) {
      cart = this.cartRepository.create({
        anonymousId
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  private async calculateUnitPrice(productId: string, optionIds: string[]): Promise<number> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: {
        optionGroups: {
          options: true
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const optionGroups = product.optionGroups ?? [];
    const basePrice = product.basePrice;

    let modifiers = 0;
    for (const optionId of optionIds) {
      for (const group of optionGroups) {
        const option = (group.options ?? []).find(opt => opt.id === optionId);
        if (option) {
          modifiers += Number(option.priceModifier);
          break;
        }
      }
    }

    return basePrice + modifiers;
  }

  private serializeCart(cart: Cart | null, user?: User): SerializedCart {
    if (!cart) {
      return { items: [] };
    }

    return {
      id: cart.id,
      userId: user?.id || cart.userId || null,
      anonymousId: cart.anonymousId,
      items: (cart.items ?? []).map((item: CartItem) => ({
        id: item.id,
        productId: item.productId,
        productName: (item as any).product?.name || '',
        quantity: item.quantity,
        selectedOptionIds: item.selectedOptionIds,
        unitPrice: Number(item.unitPrice)
      }))
    };
  }

  private async getCartById(cartId: string): Promise<Cart | null> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: {
        items: {
          product: true
        },
        user: true
      }
    });
    return cart;
  }

  private async getCartForUserId(userId: string): Promise<{ cart: Cart | null; user: User | null }> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return { cart: null, user: null };
    }

    const cart = await this.cartRepository.findOne({
      where: { userId: user.id },
      relations: {
        items: {
          product: true
        },
        user: true
      }
    });
    return { cart, user };
  }

  private async getCartForAnonymousId(anonymousId: string): Promise<Cart | null> {
    const cart = await this.cartRepository.findOne({
      where: { anonymousId },
      relations: {
        items: {
          product: true
        },
        user: true
      }
    });
    return cart;
  }

  async getCart(userId?: string, anonymousId?: string): Promise<SerializedCart> {
    let cart: Cart | null = null;
    let user: User | null = null;
    
    if (userId) {
      const result = await this.getCartForUserId(userId);
      cart = result.cart;
      user = result.user;
    }
    if (!cart && anonymousId) {
      cart = await this.getCartForAnonymousId(anonymousId);
      if (cart?.user) {
        user = cart.user;
      }
    }
    if (!cart) {
      return { items: [] };
    }
    return this.serializeCart(cart, user || undefined);
  }

  async mergeCart(userId: string | undefined, payload: MergeCartDto): Promise<SerializedCart> {
    if (!userId) {
      throw new UnauthorizedException('User authentication is required to merge carts');
    }

    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const targetCart = await this.ensureCartForUser(userId);
    const itemsToMerge: CartItemDto[] = [...payload.items];

    if (payload.anonymousId) {
      const anonymousCart = await this.getCartForAnonymousId(payload.anonymousId);
      if (anonymousCart) {
        for (const item of anonymousCart.items ?? []) {
          itemsToMerge.push({
            productId: item.productId,
            quantity: item.quantity,
            selectedOptionIds: item.selectedOptionIds
          });
        }
        // Delete the cart and its items
        await this.cartItemRepository.delete({ cartId: anonymousCart.id });
        await this.cartRepository.delete({ id: anonymousCart.id });
      }
    }

    // Remove existing items
    await this.cartItemRepository.delete({ cartId: targetCart.id });

    // Create new items
    for (const item of itemsToMerge) {
      const unitPrice = await this.calculateUnitPrice(item.productId, item.selectedOptionIds);
      const cartItem = this.cartItemRepository.create({
        cartId: targetCart.id,
        productId: item.productId,
        quantity: item.quantity,
        selectedOptionIds: item.selectedOptionIds,
        unitPrice
      });
      await this.cartItemRepository.save(cartItem);
    }

    const updatedCart = await this.getCartById(targetCart.id);
    return this.serializeCart(updatedCart, user);
  }

  async addItem(
    userId: string | undefined,
    anonymousId: string | undefined,
    payload: AddItemDto
  ): Promise<SerializedCart> {
    const targetAnonymousId = payload.anonymousId ?? anonymousId;
    let user: User | null = null;
    let cart: Cart;
    
    if (userId) {
      user = await this.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      cart = await this.ensureCartForUser(userId);
    } else {
      cart = await this.ensureCartForAnonymous(targetAnonymousId ?? randomUUID());
    }

    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId: payload.productId
      }
    });

    const unitPrice = await this.calculateUnitPrice(payload.productId, payload.selectedOptionIds);

    if (existingItem) {
      existingItem.quantity += payload.quantity;
      existingItem.selectedOptionIds = payload.selectedOptionIds;
      existingItem.unitPrice = unitPrice;
      await this.cartItemRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: payload.productId,
        quantity: payload.quantity,
        selectedOptionIds: payload.selectedOptionIds,
        unitPrice
      });
      await this.cartItemRepository.save(cartItem);
    }

    const updatedCart = await this.getCartById(cart.id);
    return this.serializeCart(updatedCart, user || undefined);
  }

  async updateItem(
    userId: string | undefined,
    anonymousId: string | undefined,
    itemId: string,
    payload: UpdateItemDto
  ): Promise<SerializedCart> {
    const activeAnonymousId = payload.anonymousId ?? anonymousId;
    let cart: Cart | null = null;
    let user: User | null = null;
    
    if (userId) {
      const result = await this.getCartForUserId(userId);
      cart = result.cart;
      user = result.user;
    } else if (activeAnonymousId) {
      cart = await this.getCartForAnonymousId(activeAnonymousId);
      if (cart?.user) {
        user = cart.user;
      }
    }

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = payload.quantity;
    await this.cartItemRepository.save(cartItem);

    const updatedCart = await this.getCartById(cart.id);
    return this.serializeCart(updatedCart, user || undefined);
  }

  async removeItem(
    userId: string | undefined,
    anonymousId: string | undefined,
    itemId: string
  ): Promise<SerializedCart> {
    let cart: Cart | null = null;
    let user: User | null = null;
    
    if (userId) {
      const result = await this.getCartForUserId(userId);
      cart = result.cart;
      user = result.user;
    } else if (anonymousId) {
      cart = await this.getCartForAnonymousId(anonymousId);
      if (cart?.user) {
        user = cart.user;
      }
    }

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);
    const updatedCart = await this.getCartById(cart.id);
    return this.serializeCart(updatedCart, user || undefined);
  }
}
