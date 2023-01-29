import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';
import { Commodity } from './commodity';

@HateoasResource('lastExpenseItems')
export class LastCommodity extends Entity {

  transactionDate: Date | undefined;

  commodity: Commodity | undefined;

  commodityLink: string | undefined;

  daysAgo: number = 0;

  qty: number = 0;

  unit: string | undefined;

  price: number = 0;

  currency: string | undefined;
}
