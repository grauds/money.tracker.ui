import { Resource } from '@lagoshny/ngx-hateoas-client';
import { Utils } from '../utils/utils';

export class Entity extends Resource {

  name: string | undefined;

  static getRelativeSelfLinkHref(resource: Resource): string {
    if (resource) {
      return Utils.parseResourceUrlToAppUrl(resource.getSelfLinkHref());
    } else return ''
  }

  static getRelativeLinkHref(resource: string): string {
    if (resource) {
      return Utils.parseResourceUrlToAppUrl(resource);
    } else return ''
  }
}
