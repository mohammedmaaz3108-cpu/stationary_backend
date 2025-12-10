import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get() async getProduct() {
    return this.productsService.getProduct();
  }

  @Get(':id')
  getProductById(@Param('id') id: any) {
    return this.productsService.getProductById(id);
  }

  // @Post() async createProduct(@Body() body: any) {
  //   return this.productsService.createProduct(body);
  // }
}
