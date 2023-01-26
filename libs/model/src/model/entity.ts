import { Resource } from '@lagoshny/ngx-hateoas-client';
import { Utils } from '../utils/utils';

export class Entity extends Resource {

  name: string | undefined;

  static getRelativeSelfLinkHref(resource: Resource): string {
    return Utils.parseResourceUrlToAppUrl(resource.getSelfLinkHref());
  }
}
