import { HateoasProjection } from '@lagoshny/ngx-hateoas-client';
import { Commodity } from './commodity';
import { Entity } from './entity';

@HateoasProjection(Commodity, 'commodityLink')
export class CommodityLink extends Entity {}
