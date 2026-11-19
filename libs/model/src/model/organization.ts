import { Entity } from './entity';
import { HateoasResource } from '@lagoshny/ngx-hateoas-client';

@HateoasResource('organizations')
export class Organization extends Entity {
  address: string | undefined;
  remarks: string | undefined;
  url: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  fax: string | undefined;
  fullname: string | undefined;
  static readonly resourceName = 'Organization';
}
