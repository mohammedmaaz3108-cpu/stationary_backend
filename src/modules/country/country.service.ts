import { Body, Inject, Injectable } from '@nestjs/common';
import { ModelsService } from 'src/common/models/models.service';

@Injectable()
export class CountryService {
  constructor(
    @Inject('MODELS') private readonly models,
    private readonly modelService: ModelsService,
  ) {}

  async getCountry() {
    const data = await this.modelService.getAllDataService(
      this.models.prjModels.Country,
      {},
    );
    return data;
  }

  async createCountry(body: any) {
    console.log(body);

    const { city, state, pin_code, country_name } = body;
    console.log(city, state, pin_code, country_name);

    const [country, created] = await this.models.prjModels.Country.findOrCreate(
      {
        where: { city },
        defaults: { state, pin_code, country_name },
      },
    );

    console.log(country, created);

    const message = created
      ? 'new country is added'
      : 'This country is already exist';
    return message;
  }
}
