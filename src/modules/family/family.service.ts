import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { platform } from 'os';
import { ModelsService } from 'src/common/models/models.service';
import { errorResponse, successResponse } from 'src/utils/responseUtil';

@Injectable()
export class FamilyService {
  constructor(
    @Inject('MODELS') private readonly models,
    private readonly modelsService: ModelsService,
  ) {}

  async getFamily() {
    const data = await this.modelsService.getAllDataService(
      this.models.prjModels.Family,
      {},
    );
    return successResponse(HttpStatus.ACCEPTED, data, 'Success');
  }

  // CREATE FAMILY
  async createFamily(body: any) {
    console.log(body);
    const { name, fatherName, age } = body;
    console.log(name, fatherName, age);
    const [family, created] = await this.models.prjModels.Family.findOrCreate({
      where: { name },
      defaults: { fatherName, age },
    });
    console.log(family, created);

    const message = created
      ? 'New family member added successfully'
      : 'This family memeber already exist';
    return successResponse(HttpStatus.ACCEPTED, family, message);
  }

  // UPDATE FAMILY MEMBER
  async updateFamily(body: any) {
    const { id } = body;

    const family = await this.modelsService.getDataService(
      this.models.prjModels.Family,
      {
        where: {
          id: id,
        },
      },
    );

    console.log(family);

    if (!platform) {
      throw new HttpException(
        errorResponse(HttpStatus.BAD_GATEWAY, 'platform not found', 'error'),
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.models.prjModels.Family.update(body, {
      fields: ['name', 'fatherName', 'age'],
      where: { id },
    });

    return successResponse(
      HttpStatus.ACCEPTED,
      family,
      'member updated successfull',
    );
  }

  // DELETE FAMILY
  async deleteFamily(id: any) {
    console.log(id);

    const family = await this.modelsService.getDataByIdService(
      this.models.prjModels.Family,
      id,
    );
    if (!family) {
      throw new HttpException(
        errorResponse(HttpStatus.BAD_GATEWAY, family, 'error'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const removeFamily = await family.destroy({});

    if (!removeFamily) {
      throw new HttpException(
        (HttpStatus.BAD_REQUEST, 'Error - unable to delete family member'),
        HttpStatus.BAD_REQUEST,
      );
    }
    return successResponse(
      HttpStatus.ACCEPTED,
      removeFamily,
      'successfully delete the family member',
    );
  }
}
