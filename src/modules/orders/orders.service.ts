import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from 'src/auth/dto/orderdto/order.dto';
import { ModelsService } from 'src/common/models/models.service';
import { NodeMailerService } from 'src/common/node-mailer/node-mailer.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('MODELS') private readonly models,
    private readonly nodeMailerService: NodeMailerService,
    private readonly modelsService: ModelsService,
  ) {}

  async createOrder(body: CreateOrderDto) {
    const { userId, productId, quantity } = body;
    // console.log(body);
    const product = await this.modelsService.getDataByIdService(
      this.models.prjModels.Products,
      productId,
    );
    // console.log(product);
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    const productData = product.get();
    const user = await this.modelsService.getDataByIdService(
      this.models.prjModels.Users,
      userId,
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userData = user.get();

    const order = await this.modelsService.createDataService(
      this.models.prjModels.Orders,
      {
        userId,
        productId,
        quantity,
        price: productData.price,
        totalAmount: productData.price * quantity,
      },
    );

    await this.nodeMailerService.sendMail({
      to: userData.email,
      subject: 'Order Confirmation',
      html: `
        <h2>Your Order is Confirmed!</h2>
        <p>Hello <strong>${userData.fullName}</strong>,</p>
        <p>Your order has been placed successfully.</p>

        <h3>Order Details</h3>
        <ul>
          <li><strong>Product:</strong> ${productData.name}</li>
          <li><strong>Price:</strong> ₹${productData.price}</li>
          <li><strong>Quantity:</strong> ${quantity}</li>
          <li><strong>Total:</strong> ₹${productData.price * quantity}</li>
        </ul>

        <p>We will notify you when the order ships.</p>
        <br/>
        <p>Thank you for shopping with us!</p>
      `,
    });
    return {
      success: true,
      message: 'Order placed successfully',
      order,
    };
  }
}
