import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';
import { Commodity } from './commodity';
import { Organization } from './organization';

@HateoasResource('incomeItems')
export class IncomeItem extends Entity {
  commodity: Commodity | undefined;

  total = 0;

  tradeplace: Organization | undefined;

  transferDate = '';

  commodityLink: string | undefined;

  tradeplaceLink: string | undefined;
}
