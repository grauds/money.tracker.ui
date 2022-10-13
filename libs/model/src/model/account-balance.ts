import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';

@HateoasResource('accountsTotals')
export class AccountBalance extends Entity {

  balance: number = 0;

  code: string = '';

}
