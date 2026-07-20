import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  Sort as RestSort
} from '@lagoshny/ngx-hateoas-client';
import { Utils } from '@clematis-shared/model';

import { CookieStatePersistence } from '../cookie-state-persistence';
import { CookieService } from '../../../service/cookie.service';
import { UrlStateAdapter } from '../url-state-adapter/url-state-adapter';

@Injectable()
export class EntityListPersistenceService {
  private defaultPage = 10;
  private defaultSort: RestSort = { name: 'ASC' };

  private cookiePersistence!: CookieStatePersistence;
  private updateRouterState = true;
  private queryParamsMode: 'merge' | 'preserve' | '' | null = 'merge';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
  ) {
    console.log(
      'EntityListPersistenceService: Instance created via dependency injection wrapper',
    );
  }

  public configure(config: {
    cookieKey?: string;
    updateRouterState: boolean;
    queryParamsMode: 'merge' | 'preserve' | '' | null;
  }) {
    console.log(
      'EntityListPersistenceService: Configuring state boundaries',
      config,
    );
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
    n: number | null;
    limit: number | null;
    sort: RestSort | null;
    filter: Map<string, string>;
  } {
    console.log(
      'EntityListPersistenceService: Calculating initial state baseline vector',
    );
    if (this.updateRouterState) {
      const snapshot = this.route.snapshot.queryParams;
      const hasRouteParams =
        snapshot && ('page' in snapshot || 'size' in snapshot);

      if (hasRouteParams) {
        const parsed = UrlStateAdapter.parseParams(snapshot);
        console.log(
          'EntityListPersistenceService: Found active URL pagination criteria to inherit:',
          parsed,
        );
        return parsed;
      }
    }

    const savedCookieState = this.cookiePersistence.loadState();
    console.log('EntityListPersistenceService loaded', savedCookieState);
    if (savedCookieState) {
      const cookieState = {
        n: savedCookieState.n ?? 0,
        limit: savedCookieState.limit ?? this.defaultPage,
        sort: savedCookieState.sort ?? this.defaultSort,
        filter: new Map(savedCookieState.filter ?? []),
      };
      console.log(
        'EntityListPersistenceService: Found active local cookie criteria to inherit:',
        cookieState,
      );
      return cookieState;
    }

    console.log(
      'EntityListPersistenceService: No explicit bounds found. Falling back to cold application defaults.',
    );
    return {
      n: 0,
      limit: this.defaultPage,
      sort: this.defaultSort,
      filter: new Map(),
    };
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
    console.log('EntityListPersistenceService: saveState sequence requested', {
      n,
      limit,
      sort,
      filter: filter,
    });

    const currentParamsSnapshot = { ...this.route.snapshot.queryParams };

    if (this.updateRouterState) {
      const extras = UrlStateAdapter.buildRouteParameters(
        n,
        limit,
        sort,
        filter,
        this.queryParamsMode,
        this.route,
      );

      console.log(`EntityListPersistenceService: Building route parameters`, extras)

      const { target, isPaginationEqual, isFiltersEqual } =
        Utils.compareParameters(extras, filter, currentParamsSnapshot);

      if (isPaginationEqual && isFiltersEqual) {
        console.log(
          'EntityListPersistenceService: Isolated grid variables match ' +
            'current URL coordinates. Skipping navigation to prevent loops.',
        );
        return Promise.resolve(true);
      }

      console.log(
        'EntityListPersistenceService: Structural change detected. ' +
          'Pushing state transitions to Router engine:',
        target,
      );

      const queryParams = {
        ...(extras.queryParams ?? {}),
      } as Record<string, string | number | null>;

      Object.keys(currentParamsSnapshot).forEach((key) => {
        if (!Utils.notPaginationParams(key)) {
          return;
        }

        if (!(key in queryParams)) {
          queryParams[key] = null;
        }
      });

      const routerConfig: NavigationExtras = {
        ...extras,
        queryParams,
        queryParamsHandling: 'merge',
      };

      console.log(`EntityListPersistenceService: Built route parameters`, routerConfig)

      return this.router.navigate([], routerConfig);
    }

    // Fallback to cookie storage engine strategy path
    console.log(
      'EntityListPersistenceService: updateRouterState is disabled. ' +
        'Dropping payload data into cookie files.',
    );
    this.cookiePersistence.saveState(n, limit, sort, filter);
    return Promise.resolve(true);
  }
}
