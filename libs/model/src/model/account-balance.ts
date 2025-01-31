import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';

@HateoasResource('accountsTotals')
export class AccountBalance extends Entity {
  balance = 0;

  code = '';
}
