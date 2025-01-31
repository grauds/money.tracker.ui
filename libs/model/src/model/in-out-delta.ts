import { Entity } from './entity';
import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Commodity } from './commodity';
import { MoneyType } from './money-type';

@HateoasResource('inOutDeltas')
export class InOutDelta extends Entity {
  delta = 0;

  commodity: Commodity | undefined;

  commodityLink: string | undefined;

  moneyType: MoneyType | undefined;

  moneyTypeLink: string | undefined;
}
