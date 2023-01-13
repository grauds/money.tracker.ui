import { HateoasResource, Resource } from "@lagoshny/ngx-hateoas-client";
import { MoneyType, Organization } from "@clematis-shared/model";

@HateoasResource('exchange')
export class MoneyExchange extends Resource {


  exchangedate: string = ''


  source: number = 0


  dest: number = 0


  usermt: number = 0


  tradeplace: Organization = new Organization();


  feepercent: number = 0

  rate: number = 0

  sourceamount: number = 0

  destamount: number = 0

  sourcemoneytype: MoneyType = new MoneyType()

  destmoneytype: MoneyType = new MoneyType()

  remarks: string = ''

  feecomm: number = 0

  fee: number = 0

  calcfield: number = 0

  comm: number = 0
}
