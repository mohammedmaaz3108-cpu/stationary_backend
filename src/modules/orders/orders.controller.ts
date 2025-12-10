import { Body, Controller, Post, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from 'src/auth/dto/orderdto/order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  async createOrder(@Body() body: CreateOrderDto) {
    return this.ordersService.createOrder(body);
  }
}
