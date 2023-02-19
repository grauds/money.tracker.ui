import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Commodity } from './commodity';
import { Organization } from './organization';
import { Entity } from "./entity";

@HateoasResource('expenseItems')
export class ExpenseItem extends Entity {

  qty = 0;

  price = 0;

  remarks = '';

  commodity: Commodity | undefined;

  total = 0;

  tradeplace: Organization | undefined;

  transferDate = '';

  commodityLink: string | undefined;

  tradeplaceLink: string | undefined;
}
