import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ModelsService } from 'src/common/models/models.service';
import { NodeMailerService } from 'src/common/node-mailer/node-mailer.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, ModelsService, NodeMailerService],
})
export class OrdersModule {}
