import { Entity } from './entity';
import { HateoasResource } from '@lagoshny/ngx-hateoas-client';

@HateoasResource('commodityGroups')
export class CommodityGroup extends Entity {
  description: string | undefined;
}
