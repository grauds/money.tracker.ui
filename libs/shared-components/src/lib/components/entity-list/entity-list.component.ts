import { Observable, of, Subscription, switchMap, tap } from 'rxjs';
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
} from "@angular/core";
import {
  ActivatedRoute,
  NavigationExtras,
  Params,
  Router,
} from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Entity, SearchRequest } from '@clematis-shared/model';
import {
  PagedResourceCollection,
  Sort as RestSort,
  SortOrder
} from '@lagoshny/ngx-hateoas-client';

import { SearchService } from '../../service/search.service';

export type ViewRepresentation = 'list' | 'table' | 'thumbnail';

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.sass'],
  standalone: false
})
export class EntityListComponent<T extends Entity> implements OnInit, OnDestroy {

  @Input() searchServiceOverride?: SearchService<T>;

  @Input() defaultView: ViewRepresentation = 'list';
  @Input() currentView: ViewRepresentation = 'list';

  @Input() listTemplate?: TemplateRef<any>;
  @Input() tableTemplate?: TemplateRef<any>;
  @Input() thumbnailTemplate?: TemplateRef<any>;
  @Input() filterTemplate: TemplateRef<any> | undefined;

  @Input() sort: RestSort | null = null;
  @Input() queryParamsMode: 'merge' | 'preserve' | '' | null = 'merge';
  @Input() loadOnInit = true;
  @Input() searchRequest?: SearchRequest;

  @Input() updateRouterState = true;
  @Input() cookieStateKey?: string;

  @Input() searchService!: SearchService<T>;
  searchRequest$: EventEmitter<SearchRequest | undefined> = new EventEmitter<
    SearchRequest | undefined
  >();
  pageSubscription?: Subscription;

  @Output() filter$: EventEmitter<Map<string, string>> = new EventEmitter<
    Map<string, string>
  >();
  filter: Map<string, string> = new Map<string, string>();

  @Output() statusDescription$: Observable<string> | undefined;
  @Output() entitiesChange$: EventEmitter<T[]> = new EventEmitter<T[]>();
  entities: T[] | null = [];

  @Output() loading$: EventEmitter<boolean> = new EventEmitter<boolean>();
  loading = false;

  total: number | undefined;
  limit = 10;
  n = 0;
  error: string | undefined;

  public constructor(
    private readonly injector: Injector,
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    this.entitiesChange$.subscribe((entities: T[] | null) => {
      this.entities = entities;
    });

    this.loading$.subscribe((value: boolean) => {
      this.loading = value;
    });
  }

  /**
   * Safe service resolution order:
   * 1. Check for the new SEARCH_SERVICE_TOKEN (Directive approach)
   * 2. Fall back to the legacy 'searchService'
   * string token (Legacy Page-level provider)
   */
  private resolveSearchService(): void {
    if (this.searchServiceOverride) {
      this.searchService = this.searchServiceOverride;
      return;
    }
    const legacyService
      = this.injector.get<SearchService<T>>('searchService', null);
    if (!legacyService) {
      throw new Error(
        `EntityListComponent configuration missing.
        Please provide a search service instance
        either by implementing [searchServiceOverride] or
        via providers: [{ provide: 'searchService', ... }].`
      );
    }
    this.searchService = legacyService;
  }

  ngOnInit(): void {

    this.resolveSearchService();

    this.statusDescription$ = this.searchService.getStatusDescription();
    this.subscribeToSearchRequests();

    let stateLoadedFromCookie = false;
    if (this.cookieStateKey) {
      stateLoadedFromCookie = this.loadStateFromCookie();
    }

    if (this.updateRouterState) {
      this.pageSubscription = this.route.queryParams
        .subscribe((queryParams: Params) => {
        if (stateLoadedFromCookie) {
          stateLoadedFromCookie = false;
          return;
        }
        this.updateFromParameters(queryParams);
      });
    }

    if (this.hasTemplate(this.defaultView)) {
      this.currentView = this.defaultView;
    } else if (this.listTemplate) {
      this.currentView = 'list';
    } else if (this.tableTemplate) {
      this.currentView = 'table';
    } else if (this.thumbnailTemplate) {
      this.currentView = 'thumbnail';
    }

    if (this.loadOnInit) {
      this.loadData();
    }
  }

  updateFromParameters(queryParams: Params) {
    const page: number = Number.parseInt(queryParams['page'], 10);
    this.n = isNaN(page) ? 0 : page;

    const size: number = Number.parseInt(queryParams['size'], 10);
    this.limit = isNaN(size) ? 10 : size;

    const sort = queryParams['sort'];
    if (sort) {
      const sortString: string = Array.isArray(sort) ? sort[0] : sort;
      const s: string[] = sortString.split(',');
      if (s.length === 2) {
        this.sort = { [s[0]]: s[1] as SortOrder };
      }
    }

    Object.keys(queryParams).forEach((k) => {
      if (k !== 'page' && k !== 'size' && k !== 'sort') {
        this.filter.set(k, queryParams[k]);
      }
    });
  }

  /**
   * Generates a completely unique cookie key string per page route.
   * Strips dynamic queries and transforms slashes to safe underscores.
   */
  private getRouteIsolatedCookieKey(): string | null {
    if (!this.cookieStateKey) {
      return null;
    }

    // Extract base pathname without URL query params
    const basePath = this.router.url.split('?')[0];

    // Standardize key name format (e.g., 'app_state__admin_users_dashboard')
    const sanitizedPath = basePath.replace(/\//g, '_');
    return `${this.cookieStateKey}_${sanitizedPath}`;
  }

  private saveStateToCookie(): void {
    const uniqueKey = this.getRouteIsolatedCookieKey();
    if (!uniqueKey) {
      return;
    }
    const state = {
      n: this.n,
      limit: this.limit,
      sort: this.sort,
      filter: Array.from(this.filter.entries())
    };
    document.cookie
      = `${uniqueKey}=${encodeURIComponent(JSON.stringify(state))}; path=/; SameSite=Strict`;
  }

  private loadStateFromCookie(): boolean {
    const uniqueKey = this.getRouteIsolatedCookieKey();
    if (!uniqueKey) {
      return false;
    }

    const match
      = document.cookie.match(
        new RegExp('(^| )' + uniqueKey + '=([^;]+)')
    );
    if (!match) {
      return false;
    }

    try {
      const state = JSON.parse(decodeURIComponent(match[2]));
      this.n = state.n ?? 0;
      this.limit = state.limit ?? 10;
      this.sort = state.sort ?? null;
      this.filter = new Map<string, string>(state.filter ?? []);
      return true;
    } catch (e) {
      console.error('Failed parsing state cookie structure', e);
      return false;
    }
  }

  get providedTemplatesCount(): number {
    let count = 0;
    if (this.listTemplate) {
      count++;
    }
    if (this.tableTemplate) {
      count++;
    }
    if (this.thumbnailTemplate) {
      count++;
    }
    return count;
  }

  private hasTemplate(view: ViewRepresentation): boolean {
    if (view === 'list') {
      return !!this.listTemplate;
    }
    if (view === 'table') {
      return !!this.tableTemplate;
    }
    if (view === 'thumbnail') {
      return !!this.thumbnailTemplate;
    }
    return false;
  }

  public loadData() {
    this.loading$.next(true);
    this.searchRequest$.next(this.searchRequest);
  }

  refreshData(searchRequest?: SearchRequest, resetPages = true) {
    if (resetPages) {
      this.n = 0;
    }
    if (searchRequest) {
      this.searchRequest = searchRequest;
    }
    this.saveStateToCookie();
    this.conditionalRouteUpdate().then(() => {
      this.loadData();
    });
  }

  private subscribeToSearchRequests() {
    this.searchRequest$
      .pipe(
        tap(() => {
          this.searchService.setProcessingStatusDescription('search');
        }),
        switchMap((searchRequest: SearchRequest | undefined) => {
          const params = {
            pageParams: this.getPageParams(),
            sort: this.getSort(),
            useCache: this.getUseCache(),
          };

          return searchRequest?.queryName
            ? this.searchService.searchPage(
                {
                  ...params,
                  params: {
                    ...searchRequest.queryArguments,
                    ...this.getFilterParams(),
                    ...searchRequest.filterParams,
                  },
                },
                searchRequest.queryName
              )
            : this.searchService.getPage(params);
        }),
        switchMap(this.executePostProcessing.bind(this))
      )
      .subscribe({
        next: this.broadcastResults.bind(this),
        error: (err: Error) => {
          this.error = err.message;
          this.entitiesChange$.error(err);
          this.loading$.next(false);
          throw new Error(err.message);
        },
        complete: () => {
          this.entitiesChange$.complete();
        },
      });
  }

  public broadcastResults(page: PagedResourceCollection<T>): void {
    this.total = page.totalElements;
    this.limit = page.pageSize;
    this.error = undefined;
    this.loading$.next(false);
    this.entitiesChange$.next(page.resources);
  }

  public executePostProcessing(
    searchResult: PagedResourceCollection<T>
  ): Observable<PagedResourceCollection<T>> {
    const handler
      = this.searchService.getPostProcessingStream();
    if (handler) {
      this.searchService.setProcessingStatusDescription('post processing');
      return handler(searchResult);
    }
    return of(searchResult);
  }

  conditionalRouteUpdate(): Promise<boolean> {
    if (this.updateRouterState) {
      return this.router.navigate([], this.getRouteParameters());
    }
    return Promise.resolve(true);
  }

  getRouteParameters(): NavigationExtras {
    let queryParams: Params = this.getPageParams();

    if (this.getSort()) {
      queryParams = { ...queryParams, ...this.getSortParams() };
    }

    const filterParams = this.getFilterParams();
    if (filterParams) {
      queryParams = { ...queryParams, ...filterParams };
    }

    if (this.queryParamsMode === 'merge') {
      this.route.snapshot.queryParamMap?.keys.forEach((key) => {
        if (
          key !== 'page' &&
          key !== 'size' &&
          key !== 'sort' &&
          !this.filter.has(key)
        ) {
          queryParams[key] = null;
        }
      });
    }

    return {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: this.queryParamsMode,
      skipLocationChange: false,
      replaceUrl: true,
    };
  }

  getPageParams() {
    return {
      page: this.n,
      size: this.limit,
    };
  }

  setCurrentPage(event: PageEvent) {
    this.n = event.pageIndex;
    this.limit = event.pageSize;
    this.saveStateToCookie();
    this.conditionalRouteUpdate().then(() => {
      this.loadData();
    });
  }

  setView(view: ViewRepresentation) {
    this.currentView = view;
  }

  getSort(): RestSort {
    return this.sort ?? {};
  }

  getSortParams(): Params | null {
    if (this.sort !== null) {
      return {
        sort: Object.keys(this.sort)
          .map((k) => {
            return [k, this.sort !== null ? this.sort[k] : ''];
          })
          .join(','),
      };
    }
    return null;
  }

  setSort(sort: Sort) {
    if (sort?.direction) {
      this.sort = {
        [sort.active]: sort.direction.toUpperCase() as SortOrder,
      };
    } else {
      this.sort = null;
    }
    this.saveStateToCookie();
    this.conditionalRouteUpdate().then(() => {
      this.loadData();
    });
  }

  getFilterParams(): Params | null {
    if (this.filter !== null) {
      const queryParams: Params = {};
      this.filter.forEach((value, key) => {
        queryParams[key] = value;
      });
      return queryParams;
    }
    return null;
  }

  setFilter(id?: string, value?: string) {
    if (id && value) {
      this.filter$.next(this.filter.set(id, value));
    } else {
      this.removeFilter(id);
    }
    this.saveStateToCookie();
  }

  removeFilter(id?: string) {
    if (id && this.filter.delete(id)) {
      this.filter$.next(this.filter);
      this.saveStateToCookie();
    }
  }

  clearFilter() {
    this.filter = new Map<string, string>();
    this.filter$.next(this.filter);
    this.saveStateToCookie();
  }

  getUseCache(): boolean {
    return true;
  }

  ngOnDestroy(): void {
    if (this.pageSubscription) {
      this.pageSubscription.unsubscribe();
    }
  }
}
