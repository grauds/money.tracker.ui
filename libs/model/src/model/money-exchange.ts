import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { MoneyType } from './money-type';
import { Organization } from './organization';
import { Entity } from './entity';

@HateoasResource('exchange')
export class MoneyExchange extends Entity {
  exchangedate = '';

  source = 0;

  sourceLink: string | undefined;

  dest = 0;

  destLink: string | undefined;

  usermt = 0;

  tradeplace: Organization = new Organization();

  feepercent = 0;

  rate = 0;

  sourceamount = 0;

  destamount = 0;

  sourcemoneytype: MoneyType = new MoneyType();

  destmoneytype: MoneyType = new MoneyType();

  remarks = '';

  feecomm = 0;

  fee = 0;

  calcfield = 0;

  comm = 0;
}
