import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ModelsModule } from './common/models/Models.Module';
import { PlatformsModule } from './modules/platforms/platforms.module';
import { CountryModule } from './modules/country/country.module';
import { FamilyModule } from './modules/family/family.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ModelsModule,
    PlatformsModule,
    CountryModule,
    FamilyModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
