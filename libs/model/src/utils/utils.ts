import { Resource } from '@lagoshny/ngx-hateoas-client';
import { NavigationExtras, Params } from '@angular/router';
import { HttpParams } from '@angular/common/http';

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
    let params: HttpParams = new HttpParams();
    const indexOfQuotationMark = routeParams['redirect'].indexOf('?');
    const hasOtherParameters = indexOfQuotationMark !== -1;
    params = params.appendAll(routeParams);

    if (hasOtherParameters) {
      // fix the redirect part
      params = params.set(
        'redirect',
        routeParams['redirect']?.substring(0, indexOfQuotationMark),
      );
      // parse the extra query parameter(s)
      const otherParams = routeParams['redirect']?.substring(
        indexOfQuotationMark + 1,
      );
      if (otherParams.indexOf('&') !== -1) {
        otherParams.split('&').forEach((pair: string) => {
          const param: string[] = pair.split('=');
          params = params.append(param[0], param[1]);
        });
      } else {
        const param: string[] = otherParams.split('=');
        params = params.append(param[0], param[1]);
      }
    }

    return params;
  }

  static parseRedirectParameters(routeParams: HttpParams): Params {
    const params: HttpParams = routeParams.delete('redirect');
    const queryParams: Params = {};
    params.keys().forEach((key) => {
      queryParams[key] = params.get(key);
    });
    return queryParams;
  }

  static removeProjection(url: string): string {
    if (url && url.indexOf('{?projection}') !== -1) {
      return url.substring(0, url.indexOf('{?projection}'));
    } else return url;
  }

  static parseResourceUrlToAppUrl(url: string) {
    if (url) {
      const resourceAddress = new URL(url);
      return resourceAddress.pathname.replace('/api', '');
    } else return '';
  }

  static getIdFromSelfUrl(entity: Resource) {
    const resourceAddress = entity.getSelfLinkHref();
    const match = resourceAddress.match(/\/([^/]+?)(?:\{|%7B|$)/);
    return match ? match[1] : '';
  }

  static getFormattedStringFromDays(numberOfDays: number): string {
    const inTheFuture = numberOfDays < 0;
    numberOfDays = Math.abs(numberOfDays);

    const years = Math.floor(numberOfDays / 365);
    const months = Math.floor((numberOfDays % 365) / 30);
    const days = Math.floor((numberOfDays % 365) % 30);

    const yearsDisplay =
      years !== 0 ? years + (years == 1 ? ' year, ' : ' years, ') : '';
    const monthsDisplay =
      months !== 0 ? months + (months == 1 ? ' month, ' : ' months, ') : '';
    const daysDisplay = days !== 0 ? days + (days == 1 ? ' day' : ' days') : '';

    if (years === 0 && months === 0 && days === 0) {
      return 'Today';
    } else {
      return (
        (inTheFuture ? 'In ' : '') + yearsDisplay + monthsDisplay + daysDisplay
      );
    }
  }

  public static compareParameters(
    extras: NavigationExtras | null | undefined,
    filter: Map<string, string> | null | undefined,
    currentRouteParams: Params,
  ) {
    // Defensively handle null/undefined arguments
    const safeExtras = extras ?? {};
    const safeFilter = filter ?? new Map<string, string>();

    // Fix the original crash: safely read queryParams from route snapshot
    const current: Params = currentRouteParams ?? {};
    const target: Params = safeExtras.queryParams ?? {};

    // Compare pagination variables safely
    const isPaginationEqual = Utils.areParamsEqual(current, target, [
      'page',
      'size',
      'sort',
    ]);

    // Safely extract dynamic filter keys
    const filterKeys = new Set<string>();
    Object.keys(current).forEach((k) => {
      if (k.startsWith('filter_')) {
        filterKeys.add(k);
      }
    });

    safeFilter.forEach((_, k) => {
      if (k.startsWith('filter_')) {
        filterKeys.add(k);
      }
    });

    // Safely convert Map and compare the active filters
    const isFiltersEqual = Utils.areParamsEqual(
      current,
      Object.fromEntries(safeFilter),
      Array.from(filterKeys),
    );

    return { target, isPaginationEqual, isFiltersEqual };
  }

  static areParamsEqual(
    params1: Record<string, unknown> | null | undefined,
    params2: Record<string, unknown> | null | undefined,
    keysToCompare?: string[],
  ): boolean {
    // Return true if both objects are missing/falsy
    if (!params1 && !params2) {
      return true;
    }

    // Return false if only one object is missing/falsy
    if (!params1 || !params2) {
      return false;
    }

    // Determine which keys to evaluate
    const keys = keysToCompare ?? Object.keys({ ...params1, ...params2 });

    for (const key of keys) {
      const val1 =
        params1[key] !== undefined && params1[key] !== null
          ? String(params1[key])
          : '';
      const val2 =
        params2[key] !== undefined && params2[key] !== null
          ? String(params2[key])
          : '';

      if (val1 !== val2) {
        return false;
      }
    }
    return true;
  }

  // Helper to safely build local YYYY-MM-DD string
  static formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
