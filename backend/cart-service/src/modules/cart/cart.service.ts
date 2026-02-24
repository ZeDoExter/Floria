import { Injectable, NotFoundException, UnauthorizedException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { randomUUID } from 'crypto';
import type { Cache } from 'cache-manager';
import { AddItemDto, CartItemDto, MergeCartDto, UpdateItemDto } from './dto/cart-item.dto.js';
import type { SerializedCart } from './cart.types.js';

@Injectable()
export class CartService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  private getCartKey(userId?: string, anonymousId?: string): string | null {
    if (userId) return `cart:user:${userId}`;
    if (anonymousId) return `cart:anonymous:${anonymousId}`;
    return null;
  }

  private async fetchCart(key: string): Promise<SerializedCart> {
    const data = await this.cacheManager.get<string>(key);
    if (!data) return { items: [] };
    try {
      return JSON.parse(data) as SerializedCart;
    } catch {
      return { items: [] };
    }
  }

  private async saveCart(key: string, cart: SerializedCart): Promise<void> {
    await this.cacheManager.set(key, JSON.stringify(cart)); // ttl is globally set to 7 days
  }

  async getCart(userId?: string, anonymousId?: string): Promise<SerializedCart> {
    const key = this.getCartKey(userId, anonymousId);
    if (!key) return { items: [] };

    const cart = await this.fetchCart(key);
    if (userId) cart.userId = userId;
    if (anonymousId) cart.anonymousId = anonymousId;
    return cart;
  }

  async mergeCart(userId: string | undefined, payload: MergeCartDto): Promise<SerializedCart> {
    if (!userId) {
      throw new UnauthorizedException('User authentication is required to merge carts');
    }

    const userKey = this.getCartKey(userId)!;
    const userCart = await this.fetchCart(userKey);
    userCart.userId = userId;

    let itemsToMerge = [...payload.items];

    if (payload.anonymousId) {
      const anonKey = this.getCartKey(undefined, payload.anonymousId)!;
      const anonCart = await this.fetchCart(anonKey);
      if (anonCart.items && anonCart.items.length > 0) {
        itemsToMerge = [...itemsToMerge, ...anonCart.items];
      }
      // Delete anonymous cart after merge
      await this.cacheManager.del(anonKey);
    }

    // Merge items
    userCart.items = itemsToMerge.map(item => ({
      id: randomUUID(),
      productId: item.productId,
      productName: '', // Frontend typically populates this or we leave it empty
      quantity: item.quantity,
      selectedOptionIds: item.selectedOptionIds,
      unitPrice: item.unitPrice ?? 0
    }));

    await this.saveCart(userKey, userCart);
    return userCart;
  }

  async addItem(userId: string | undefined, anonymousId: string | undefined, payload: AddItemDto): Promise<SerializedCart> {
    const targetAnonymousId = payload.anonymousId ?? anonymousId ?? randomUUID();
    const key = this.getCartKey(userId, targetAnonymousId);

    if (!key) return { items: [] };

    const cart = await this.fetchCart(key);
    if (userId) cart.userId = userId;
    else cart.anonymousId = targetAnonymousId;

    // Ensure items array exists
    cart.items = cart.items || [];

    const existingIndex = cart.items.findIndex(item =>
      item.productId === payload.productId &&
      JSON.stringify(item.selectedOptionIds) === JSON.stringify(payload.selectedOptionIds)
    );

    const price = payload.unitPrice ?? 0;

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += payload.quantity;
      cart.items[existingIndex].unitPrice = price;
    } else {
      cart.items.push({
        id: randomUUID(),
        productId: payload.productId,
        productName: '',
        quantity: payload.quantity,
        selectedOptionIds: payload.selectedOptionIds,
        unitPrice: price
      });
    }

    await this.saveCart(key, cart);
    return cart;
  }

  async updateItem(userId: string | undefined, anonymousId: string | undefined, itemId: string, payload: UpdateItemDto): Promise<SerializedCart> {
    const activeAnonymousId = payload.anonymousId ?? anonymousId;
    const key = this.getCartKey(userId, activeAnonymousId);
    if (!key) throw new NotFoundException('Cart not found');

    const cart = await this.fetchCart(key);
    if (!cart.items) cart.items = [];

    const item = cart.items.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = payload.quantity;
    await this.saveCart(key, cart);
    return cart;
  }

  async removeItem(userId: string | undefined, anonymousId: string | undefined, itemId: string): Promise<SerializedCart> {
    const key = this.getCartKey(userId, anonymousId);
    if (!key) throw new NotFoundException('Cart not found');

    const cart = await this.fetchCart(key);
    if (!cart.items) cart.items = [];

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(i => i.id !== itemId);

    if (cart.items.length === initialLength) {
      throw new NotFoundException('Cart item not found');
    }

    await this.saveCart(key, cart);
    return cart;
  }
}
