import { HateoasResource, ProjectionRel } from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';
import { Organization } from './organization';
import { CommodityLink } from './commodity-link';
import { Commodity } from './commodity';

@HateoasResource('lastExpenseItems')
export class LastCommodity extends Entity {
  transactionDate: Date | undefined;

  @ProjectionRel(Commodity)
  commodity: CommodityLink | undefined;

  commodityLink: string | undefined;

  organization: Organization | undefined;

  organizationLink: string | undefined;

  daysAgo = 0;

  qty = 0;

  unit: string | undefined;

  price = 0;

  currency: string | undefined;
}
