import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Entity } from "./entity";

@HateoasResource('expenses')
export class Expense extends Entity {

  disc = 0;

  discpercent = 0;

  disctype = '';

  discinprice = 0;

  price = 0;

  remarks = '';

  total = 0;

  totalItems = 0;

  transferDate = '';

  accountLink: string | undefined;

}
