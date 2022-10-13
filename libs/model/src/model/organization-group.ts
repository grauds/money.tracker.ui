import { Entity } from './entity';
import { HateoasResource } from '@lagoshny/ngx-hateoas-client';

@HateoasResource('organizationGroups')
export class OrganizationGroup extends Entity {

  description: string | undefined;

}
