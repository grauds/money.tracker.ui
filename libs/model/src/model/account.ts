import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';

@HateoasResource('accounts')
export class Account extends Entity {
  description: string | undefined;
}
