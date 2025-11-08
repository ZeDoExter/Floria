import { IsIn, IsString } from 'class-validator';
import { ORDER_STATUS_VALUES, type OrderStatus } from '../orders.types.js';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn([...ORDER_STATUS_VALUES])
  status!: OrderStatus;
}
