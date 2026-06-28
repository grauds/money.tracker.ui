import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';

@HateoasResource('accountGroups')
export class AccountGroup extends Entity {
  description: string | undefined;
}
