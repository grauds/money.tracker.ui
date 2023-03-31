import { Resource } from "@lagoshny/ngx-hateoas-client";
import { Params } from "@angular/router";
import { HttpParams } from "@angular/common/http";

export class Utils {

  static parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    if (base64Url !== null) {
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(atob(base64));
    } else {
      return token;
    }
  }

  static moveQueryParametersFromRedirectUrl(routeParams: Params): HttpParams {

    let params: HttpParams = new HttpParams()
    const indexOfQuotationMark = routeParams['redirect'].indexOf('?')
    const hasOtherParameters = indexOfQuotationMark !== -1
    params = params.appendAll(routeParams)

    if (hasOtherParameters) {
      // fix the redirect part
      params = params.set('redirect', routeParams['redirect']?.substring(0, indexOfQuotationMark))
      // parse the extra query parameter(s)
      const otherParams = routeParams['redirect']?.substring(indexOfQuotationMark + 1)
      if (otherParams.indexOf('&') !== -1) {
        otherParams.split('&').forEach((pair: string) => {
          const param: string[] = pair.split('=')
          params = params.append(param[0], param[1])
        })
      } else {
        const param: string[] = otherParams.split('=')
        params = params.append(param[0], param[1])
      }
    }

    return params
  }

  static parseRedirectParameters(routeParams: HttpParams): Params {
    const params: HttpParams = routeParams.delete('redirect')
    const queryParams: Params = {};
    params.keys().forEach((key) => {
      queryParams[key] = params.get(key);
    });
    return queryParams
  }

  static removeProjection(url: string): string {
    if (url && url.indexOf('{?projection}') !== -1) {
      return url.substring(0, url.indexOf('{?projection}'))
    } else return url
  }

  static parseResourceUrlToAppUrl(url: string) {
    if (url) {
      const resourceAddress = new URL(url);
      return resourceAddress.pathname.replace('/api', '');
    } else return ''
  }

  static getIdFromSelfUrl(entity: Resource) {
    const resourceAddress = new URL(entity.getSelfLinkHref());
    return resourceAddress.pathname.substring(resourceAddress.pathname.lastIndexOf('/') + 1,
      resourceAddress.pathname.length
    );
  }

  static getFormattedStringFromDays(numberOfDays: number): string {

    const inTheFuture = numberOfDays < 0;
    numberOfDays = Math.abs(numberOfDays)

    const years = Math.floor(numberOfDays / 365);
    const months = Math.floor(numberOfDays % 365 / 30);
    const days = Math.floor(numberOfDays % 365 % 30);

    const yearsDisplay = years !== 0 ? years + (years == 1 ? " year, " : " years, ") : "";
    const monthsDisplay = months !== 0 ? months + (months == 1 ? " month, " : " months, ") : "";
    const daysDisplay = days !== 0 ? days + (days == 1 ? " day" : " days") : "";

    if(years === 0 && months === 0 && days === 0) {
      return 'Today'
    } else {
      return (inTheFuture ? 'In ' : '') + yearsDisplay + monthsDisplay + daysDisplay;
    }
  }
}
