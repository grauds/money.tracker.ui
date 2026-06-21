import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Sort as RestSort
} from '@lagoshny/ngx-hateoas-client';

import { CookieStatePersistence } from '../cookie-state-persistence';
import { CookieService } from '../../../service/cookie.service';
import { UrlStateAdapter } from '../url-state-adapter/url-state-adapter';

@Injectable()
export class EntityListPersistenceService {

  private cookiePersistence!: CookieStatePersistence;
  private updateRouterState = true;
  private queryParamsMode: 'merge' | 'preserve' | '' | null = 'merge';

  private defaultSort: RestSort = { name: 'ASC' };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
  ) {}

  public configure(config: {
    cookieKey?: string;
    updateRouterState: boolean;
    queryParamsMode: 'merge' | 'preserve' | '' | null;
  }) {
    this.updateRouterState = config.updateRouterState;
    this.queryParamsMode = config.queryParamsMode;
    this.cookiePersistence = new CookieStatePersistence(
      this.router,
      this.cookieService,
      config.cookieKey,
    );
  }

  /**
   * Decides which single source of truth to use upon initialization
   */
  public getInitialState(): {
    n: number;
    limit: number;
    sort: RestSort | null;
    filter: Map<string, string>;
  } {
    if (this.updateRouterState) {
      const snapshot = this.route.snapshot.queryParams;
      const hasRouteParams = 'page' in snapshot || 'size' in snapshot;

      if (hasRouteParams) {
        return UrlStateAdapter.parseParams(snapshot);
      }
    }

    const savedCookieState = this.cookiePersistence.loadState();
    if (savedCookieState) {
      return {
        n: savedCookieState.n ?? 0,
        limit: savedCookieState.limit ?? 10,
        sort: savedCookieState.sort ?? this.defaultSort,
        filter: new Map(savedCookieState.filter ?? []),
      };
    }

    // Baseline Default Fallback
    return { n: 0, limit: 10, sort: this.defaultSort, filter: new Map() };
  }

  /**
   * Persists state to either the URL or the Cookie
   */
  public saveState(
    n: number,
    limit: number,
    sort: RestSort | null,
    filter: Map<string, string>,
  ): Promise<boolean> {
    if (this.updateRouterState) {
      const extras = UrlStateAdapter.buildRouteParameters(
        n,
        limit,
        sort,
        filter,
        this.queryParamsMode,
        this.route
      );

      // Strict matching check against active browser
      // URL to protect the browser forward stack
      const current = this.route.snapshot.queryParams;
      if (
        current['page'] === n.toString() &&
        current['size'] === limit.toString()
      ) {
        return Promise.resolve(true);
      }

      return this.router.navigate([], extras);
    }
    // else use cookies
    this.cookiePersistence.saveState(n, limit, sort, filter);
    return Promise.resolve(true);
  }
}

