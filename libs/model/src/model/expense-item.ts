import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Commodity } from './commodity';
import { Organization } from './organization';
import { Entity } from "./entity";

@HateoasResource('expenseItems')
export class ExpenseItem extends Entity {

  qty: number = 0;

  price: number = 0;

  remarks: string = '';

  commodity: Commodity | undefined;

  total: number = 0;

  tradeplace: Organization | undefined;

  transferDate: string = '';

  commodityLink: string | undefined;

  tradeplaceLink: string | undefined;
}
