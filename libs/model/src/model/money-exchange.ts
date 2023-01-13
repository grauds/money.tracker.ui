import { HateoasResource, Resource } from "@lagoshny/ngx-hateoas-client";
import { MoneyType } from './money-type';
import { Organization } from './organization';

@HateoasResource('exchange')
export class MoneyExchange extends Resource {

  exchangedate = ''

  source = 0

  dest = 0

  usermt = 0

  tradeplace: Organization = new Organization();

  feepercent = 0

  rate = 0

  sourceamount = 0

  destamount = 0

  sourcemoneytype: MoneyType = new MoneyType()

  destmoneytype: MoneyType = new MoneyType()

  remarks = ''

  feecomm = 0

  fee = 0

  calcfield = 0

  comm = 0
}
