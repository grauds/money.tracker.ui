import { Entity } from './entity';
import { HateoasResource } from '@lagoshny/ngx-hateoas-client';

@HateoasResource('organizations')
export class Organization extends Entity {
}
