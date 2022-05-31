import { Entity } from './entity';
import { HateoasResource } from '@lagoshny/ngx-hateoas-client';

@HateoasResource('commodities')
export class Commodity extends Entity {

  description: string | undefined;
}
