import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';
import { UnitType } from './unit-type';

@HateoasResource('commodities')
export class Commodity extends Entity {

  description: string | undefined;

  defaultPrice: number | undefined;

  unittype: UnitType | undefined;

}
