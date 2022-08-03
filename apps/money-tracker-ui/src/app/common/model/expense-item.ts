import { HateoasResource, Resource } from '@lagoshny/ngx-hateoas-client';
import { Commodity } from './commodity';
import { Organization } from './organization';

@HateoasResource('expenseItems')
export class ExpenseItem extends Resource {

  qty: number = 0;

  price: number = 0;

  remarks: string = '';

  commodity: Commodity | undefined;

  total: number = 0;

  tradeplace: Organization | undefined;

  transferDate: string = '';
}
