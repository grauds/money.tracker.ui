import { Router } from '@angular/router';
import {
  Sort as RestSort,
} from '@lagoshny/ngx-hateoas-client';
import { CookieService } from "../../../service/cookie.service";

/**
 * Represents the state of a component with properties for pagination, sorting, and filtering.
 *
 * @interface ComponentState
 * @property {number} n - The current page index or number.
 * @property {number} limit - The maximum number of items or records allowed per page.
 * @property {RestSort | null} sort - The sorting configuration for the data, or null if no sorting is applied.
 * @property {[string, string][]} filter - An array of key-value pairs representing filter criteria,
 * where each tuple contains a field name and its corresponding filter value.
 */
export interface ComponentState {
  n: number;
  limit: number;
  sort: RestSort | null;
  filter: [string, string][];
}

/**
 * A utility class for persisting and retrieving component state using cookies.
 * This is particularly useful for saving state information isolated by route
 * and restoring it when necessary.
 */
export class CookieStatePersistence {
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private cookieStateKey?: string
  ) {}

  /**
   * Generates and returns the unique cookie key for a route,
   * isolating it based on the current URL.
   * The key is derived by sanitizing the URL path and appending
   * it to the existing cookie state key.
   * If the cookie state key is not defined, it returns null.
   *
   * @return {string | null} The route-isolated cookie key, or null
   * if no cookie state key is present.
   */
  public getRouteIsolatedCookieKey(): string | null {
    if (!this.cookieStateKey) {
      return null;
    }
    const basePath = this.router.url.split('?')[0];
    const sanitizedPath = basePath.replace(/\//g, '_');
    return `${this.cookieStateKey}_${sanitizedPath}`;
  }

  /**
   * Saves the current state of the component to a cookie.
   *
   * @param {number} n - The current page number or index.
   * @param {number} limit - The maximum number of items per page or
   * the result limit.
   * @param {RestSort | null} sort - The sorting criteria, or null if
   * no sorting is applied.
   * @param {Map<string, string>} filter - A map containing filters applied
   * to the data, where keys represent filter names and values represent
   * filter values.
   * @return {void} This method does not return a value.
   */
  public saveState(n: number,
                   limit: number,
                   sort: RestSort | null,
                   filter: Map<string, string>
  ): void {
    const uniqueKey = this.getRouteIsolatedCookieKey();
    if (!uniqueKey) {
      return;
    }

    const state: ComponentState = {
      n,
      limit,
      sort,
      filter: Array.from(filter.entries())
    };
    this.cookieService.setState(uniqueKey, state);
  }

  /**
   * Loads the state of the component from the browser's cookies.
   *
   * This method extracts a specific cookie value associated with a
   * unique key and attempts to parse it into a ComponentState object.
   * If the key is not found or any error occurs during parsing,
   * it returns null.
   *
   * @return {ComponentState | null} The parsed component state
   * if available and valid, or null otherwise.
   */
  public loadState(): ComponentState | null {
    const uniqueKey = this.getRouteIsolatedCookieKey();
    if (!uniqueKey) {
      return null;
    }

    return this.cookieService.getState<ComponentState>(uniqueKey);
  }
}
