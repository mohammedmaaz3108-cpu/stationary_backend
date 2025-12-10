import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateOrderDto {
  @IsUUID('4', { message: 'Invalid user ID format' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;

  @IsNumber({}, { message: 'Product ID must be a number' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: number;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;

  @IsNumber({}, { message: 'Total amount must be a number' })
  @Min(1, { message: 'Total amount must be greater than 0' })
  @IsNotEmpty({ message: 'Total amount is required' })
  totalAmount: number;
}
