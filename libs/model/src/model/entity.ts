import { Resource } from '@lagoshny/ngx-hateoas-client';
import { Utils } from '../utils/utils';

export class Entity extends Resource {

  name: string | undefined;

  static getRelativeSelfLinkHref<T extends Resource>(resource: T | undefined): string {
    if (resource) {
      return Utils.parseResourceUrlToAppUrl(Utils.removeProjection(resource.getSelfLinkHref()));
    } else return ''
  }

  static getRelativeLinkHref(resource: string): string {
    if (resource) {
      return Utils.parseResourceUrlToAppUrl(resource);
    } else return ''
  }
}
