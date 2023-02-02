import {HateoasResource, ProjectionRel} from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';
import { Organization } from './organization';
import { CommodityLink } from './commodity-link';
import { Commodity } from "./commodity";

@HateoasResource('lastExpenseItems')
export class LastCommodity extends Entity {

  transactionDate: Date | undefined;

  @ProjectionRel(Commodity)
  commodity: CommodityLink | undefined;

  commodityLink: string | undefined;

  organization: Organization | undefined;

  organizationLink: string | undefined;

  daysAgo: number = 0;

  qty: number = 0;

  unit: string | undefined;

  price: number = 0;

  currency: string | undefined;
}
