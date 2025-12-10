import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ModelsService } from 'src/common/models/models.service';
import { successResponse } from 'src/utils/responseUtil';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('MODELS') private readonly models,
    private readonly modelsService: ModelsService,
  ) {}

  async getProduct() {
    const data = await this.modelsService.getAllDataService(
      this.models.prjModels.Products,
      {},
    );
    return successResponse(HttpStatus.ACCEPTED, data, 'Success');
  }

  async getProductById(id: any) {
    return await this.modelsService.getDataByIdService(
      this.models.prjModels.Products,
      id,
    );
  }

  // async createProduct(body: any) {
  //   console.log(body);
  //   const { name, slug, price, image, description, stock } = body;
  //   console.log(name, slug, price, image, description, stock);
  //   const [product, created] =
  //     await this.models.prjModels.Products.findOrCreate({
  //       where: { name },
  //       defaults: { slug, price, image, description, stock },
  //     });
  //   console.log(product, created);

  //   const message = created
  //     ? 'New product added'
  //     : 'This product is already exist';
  //   return successResponse(HttpStatus.ACCEPTED, product, message);
  // }
}
