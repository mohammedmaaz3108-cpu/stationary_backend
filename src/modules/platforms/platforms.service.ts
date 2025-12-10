import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Default } from 'sequelize-typescript';
import { ModelsService } from 'src/common/models/models.service';
import { errorResponse, successResponse } from 'src/utils/responseUtil';

@Injectable()
export class PlatformsService {
  constructor(
    @Inject('MODELS') private readonly models,
    private readonly modelsService: ModelsService,
  ) {}

  async getPlatforms() {
    const data = await this.modelsService.getAllDataService(
      this.models.prjModels.Platforms,
      {
        // attributes: ['id', 'name', 'short_name'],
        // where: { is_active: false },
      },
    );
    return successResponse(HttpStatus.ACCEPTED, data, 'Success');
  }

  async createPlatform(body: any) {
    console.log(body);
    const { name, short_name, is_active } = body;
    console.log(name, short_name, is_active);
    const [platforms, created] =
      await this.models.prjModels.Platforms.findOrCreate({
        where: { name },
        defaults: { short_name, is_active },
      });
    console.log(platforms, created);
    const message = created
      ? 'Platform added successfully'
      : 'Platform already exists';
    return successResponse(HttpStatus.ACCEPTED, platforms, message);
    // const data = await this.modelsService.createDataService
  }

  async updatePlatform(body: any) {
    const { id } = body;

    const platform = await this.modelsService.getDataService(
      this.models.prjModels.Platforms,
      {
        where: {
          id: id,
        },
      },
    );
    console.log(platform);

    if (!platform) {
      throw new HttpException(
        errorResponse(HttpStatus.BAD_REQUEST, 'platform not found', 'error'),
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.models.prjModels.Platforms.update(body, {
      fields: ['name', 'short_name', 'is_active', 'edit'],
      where: { id },
    });
    return successResponse(
      HttpStatus.ACCEPTED,
      platform,
      'Platform updated successfully',
    );
  }

  async deletePlatform(id: any) {
    console.log(id);

    const platform = await this.modelsService.getDataByIdService(
      this.models.prjModels.Platforms,
      id,
    );
    if (!platform) {
      throw new HttpException(
        errorResponse(HttpStatus.BAD_REQUEST, 'platform not found', 'error'),
        HttpStatus.BAD_REQUEST,
      );
    }
    const removePlatform = await platform.destroy({});

    if (!removePlatform) {
      throw new HttpException(
        (HttpStatus.BAD_REQUEST, 'Error - unable to delete platform'),
        HttpStatus.BAD_REQUEST,
      );
    }
    return successResponse(
      HttpStatus.ACCEPTED,
      removePlatform,
      'Platform deleted successfully',
    );
  }
}
