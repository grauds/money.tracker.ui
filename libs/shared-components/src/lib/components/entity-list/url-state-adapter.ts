import { Params, ActivatedRoute, NavigationExtras } from '@angular/router';
import {
  Sort as RestSort,
  SortOrder
} from '@lagoshny/ngx-hateoas-client';

/**
 * Adapter class for handling URL state operations,
 * including parsing and constructing query parameters.
 */
export class UrlStateAdapter {
  /**
   * Parses query parameters and returns an object containing pagination,
   * sorting, and filtering information.
   *
   * @param {Params} queryParams - The query parameters to be parsed.
   * This is expected to be an object where the keys are parameter names and
   * the values are their corresponding values.
   * @return {Object} An object containing the parsed parameters:
   * - `n`: The page number parsed from the "page" query parameter.
   * Defaults to 0 if not provided or invalid.
   * - `limit`: The page size parsed from the "size" query parameter.
   * Defaults to 10 if not provided or invalid.
   * - `sort`: A sorting object derived from the "sort" query parameter,
   * or null if not provided or invalid. The object has a single key-value pair
   * where the key is the field to sort and the value is the sort order
   * (e.g., "asc" or "desc").
   * - `filter`: A map of additional query parameters
   * (excluding "page", "size", and "sort") used for filtering.
   * Each key-value pair corresponds to a parameter name and its value.
   */
  public static parseParams(queryParams: Params): {
    n: number;
    limit: number;
    sort: RestSort | null;
    filter: Map<string, string>
  } {
    const page = Number.parseInt(queryParams['page'], 10);
    const n = isNaN(page) ? 0 : page;

    const size = Number.parseInt(queryParams['size'], 10);
    const limit = isNaN(size) ? 10 : size;

    let sort: RestSort | null = null;
    const sortParam = queryParams['sort'];
    if (sortParam) {
      const sortString: string = Array.isArray(sortParam) ? sortParam[0] : sortParam;
      const s = sortString.split(',');
      if (s.length === 2) {
        sort = { [s[0]]: s[1] as SortOrder };
      }
    }

    const filter = new Map<string, string>();
    Object.keys(queryParams).forEach((k) => {
      if (k !== 'page' && k !== 'size' && k !== 'sort') {
        filter.set(k, queryParams[k]);
      }
    });

    return { n, limit, sort, filter };
  }

  /**
   * Builds route parameters to be used for navigation with optional
   * query parameter handling, sorting, and filtering.
   *
   * @param {number} n - The page number to include in the route
   * parameters.
   * @param {number} limit - The page size (limit) to include in the
   * route parameters.
   * @param {RestSort | null} sort - The sorting configuration to include
   * in the route parameters.
   * @param {Map<string, string>} filter - A map of filter key-value pairs
   * to include in the route parameters.
   * @param {'merge' | 'preserve' | '' | null} queryParamsMode - Determines
   * how existing query parameters are handled.
   *   'merge' merges the current and new query parameters, 'preserve' keeps
   *   the current ones, and '' or null replaces them.
   * @param {ActivatedRoute} route - The currently active route used to retrieve
   * existing query parameters.
   * @return {NavigationExtras} The constructed navigation extras that can be
   * used with Angular router.
   */
  public static buildRouteParameters(
    n: number,
    limit: number,
    sort: RestSort | null,
    filter: Map<string, string>,
    queryParamsMode: 'merge' | 'preserve' | '' | null,
    route: ActivatedRoute
  ): NavigationExtras {

    const queryParams: Params = { page: n, size: limit };
    if (sort) {
      queryParams['sort']
        = Object.keys(sort).map(k => `${k},${sort[k]}`).join(',');
    }
    filter.forEach((value, key) => {
      queryParams[key] = value;
    });

    if (queryParamsMode === 'merge') {
      route.snapshot.queryParamMap?.keys.forEach((key) => {
        if (key !== 'page' && key !== 'size' && key !== 'sort' && !filter.has(key)) {
          queryParams[key] = null;
        }
      });
    }

    return {
      relativeTo: route,
      queryParams: queryParams,
      queryParamsHandling: queryParamsMode,
      skipLocationChange: false,
    };
  }
}
