import { Observable, Subscription } from 'rxjs';
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

import { CookieStatePersistence } from "./cookie-state-persistence";
import { SearchRequestHandler } from "./search-request-handler";
import { UrlStateAdapter } from "./url-state-adapter";

import { SearchService } from '../../service/search.service';
import { CookieService } from "../../service/cookie.service";

export type ViewRepresentation = 'list' | 'table' | 'thumbnail';

/**
 * Represents a context object that provides the implicit value of a specified type within a template.
 *
 * This interface is commonly used in template-bound contexts where a specific type of data
 * is accessible via the `$implicit` property. The generic type `T` defines the expected type
 * of the underlying data.
 *
 * @template T - The type of the value exposed as the implicit context.
 */
export interface EntityTemplateContext<T> {
  $implicit: T;
}

export interface EntityCollectionContext<T> {
  $implicit: T[] | null;
  entities: T[] | null;
}

/**
 * Component used to manage and display a list of entities in various
 * representations such as list, table, or thumbnail views.
 * Provides functionality for sorting, filtering, pagination,
 * and managing entity data state.
 *
 * Generic type parameter `T` represents the entity type that this component handles.
 *
 * The component supports a range of customization and integration options, including:
 * - Templates for rendering the list, table, and thumbnail views.
 * - Sorting and filtering mechanisms with state management.
 * - Interaction with route parameters or cookie storage for state persistence.
 * - Integration with a provided `SearchService` to fetch and manage entity data.
 *
 * Inputs:
 * - `searchService`: Defines the default search service for fetching entity data.
 * - `searchServiceOverride`: Optionally overrides the default search service with a custom one.
 * - `defaultView`: The default representation for the component (e.g., 'list', 'table', 'thumbnail').
 * - `currentView`: The currently active view representation.
 * - Templates (`listTemplate`, `tableTemplate`, `thumbnailTemplate`,
 * `filterTemplate`): Custom templates for rendering specific views and filters.
 * - `sort`: Specifies the sorting criteria for entity data.
 * - `queryParamsMode`: Determines the mode of URL parameter handling ('merge', 'preserve', etc.).
 * - `loadOnInit`: Flag to load entity data upon initialization.
 * - `searchRequest`: Initial search request to fetch entity data.
 * - `updateRouterState`: Flag to indicate whether router state should be updated.
 * - `cookieStateKey`: Key for persisting the component's state into a cookie.
 *
 * Outputs:
 * - `filter$`: Emits the current filter state as a map of key-value pairs.
 * - `statusDescription$`: Emits a description of the component's status.
 * - `entitiesChange$`: Emits the current list of entities when it changes.
 * - `loading$`: Emits the loading state indicator for the component.
 *
 * Public Methods:
 * - `loadData`: Initiates the loading of entity data, considering the current state and filters.
 * - `refreshData`: Refreshes the entity data with an optional search request and resets pagination if needed.
 * - `setCurrentPage`: Handles updates to the current page number and page size during pagination.
 * - `setSort`: Sets the sorting criteria for the data and reloads it accordingly.
 * - `setFilter`: Adds or updates a filter and reloads the entity data.
 * - `removeFilter`: Removes a specific filter and reloads the entity data.
 * - `clearFilter`: Clears all filters and reloads the entity data.
 * - `setView`: Updates the currently active view representation.
 *
 * Lifecycle Hooks:
 * - `ngOnInit`: Initializes the component, resolves
 * the search service, and sets up subscriptions for entity data and state changes.
 * - `ngOnDestroy`: Cleans up subscriptions to ensure no memory leaks.
 *
 * Additional Details:
 * - The component supports state persistence via URL query parameters or cookie storage.
 * - Internally manages template rendering, entity data broadcasting, and error
 * handling for a smoother user experience.
 */
@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.sass'],
  standalone: false,
})
export class EntityListComponent<T extends Entity>
  implements OnInit, OnDestroy
{
  @Input() searchService!: SearchService<T>;
  @Input() searchServiceOverride?: SearchService<T>;

  @Input() defaultView: ViewRepresentation = 'list';
  @Input() currentView: ViewRepresentation = 'list';

  @Input() listTemplate?: TemplateRef<EntityTemplateContext<T>>;
  @Input() tableTemplate?: TemplateRef<EntityCollectionContext<T>>;
  @Input() thumbnailTemplate?: TemplateRef<EntityTemplateContext<T>>;
  @Input() filterTemplate: TemplateRef<EntityTemplateContext<T>> | undefined;

  @Input() sort: RestSort | null = null;
  @Input() queryParamsMode: 'merge' | 'preserve' | '' | null = 'merge';
  @Input() loadOnInit = true;
  @Input() searchRequest?: SearchRequest;

  @Input() updateRouterState = true;
  @Input() cookieStateKey?: string;

  @Output() filter$: EventEmitter<Map<string, string>> = new EventEmitter<
    Map<string, string>
  >();
  @Output() statusDescription$: Observable<string> | undefined;
  @Output() entitiesChange$: EventEmitter<T[]> = new EventEmitter<T[]>();
  @Output() loading$: EventEmitter<boolean> = new EventEmitter<boolean>();

  searchRequest$: EventEmitter<SearchRequest | undefined> = new EventEmitter<
    SearchRequest | undefined
  >();
  filter: Map<string, string> = new Map<string, string>();
  entities: T[] | null = [];

  loading = false;
  total: number | undefined;
  limit = 10;
  n = 0;
  error: string | undefined;

  private pageSubscription?: Subscription;
  private pipelineSubscription?: Subscription;
  private cookiePersistence!: CookieStatePersistence;

  public constructor(
    private readonly injector: Injector,
    private readonly cookieService: CookieService,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {
    this.entitiesChange$.subscribe((entities: T[] | null) => {
      this.entities = entities;
    });

    this.loading$.subscribe((value: boolean) => {
      this.loading = value;
    });
  }

  private resolveSearchService(): void {
    if (this.searchServiceOverride) {
      this.searchService = this.searchServiceOverride;
      return;
    }
    const legacyService = this.injector.get<SearchService<T>>(
      'searchService',
      null,
    );
    if (!legacyService) {
      throw new Error(
        `EntityListComponent configuration missing.
        Please provide a search service instance
        either by implementing [searchServiceOverride] or
        via providers: [{ provide: 'searchService', ... }].`,
      );
    }
    this.searchService = legacyService;
  }

  ngOnInit(): void {
    this.resolveSearchService();

    this.statusDescription$ = this.searchService.getStatusDescription();
    this.cookiePersistence = new CookieStatePersistence(
      this.router,
      this.cookieService,
      this.cookieStateKey,
    );

    this.pipelineSubscription = new SearchRequestHandler(
      this.searchService,
    ).createSearchPipeline(
      this.searchRequest$,
      () => ({
        n: this.n,
        limit: this.limit,
        sort: this.sort,
        filter: this.filter,
      }),
      (page) => this.broadcastResults(page),
      (err) => {
        this.error = err.message;
        this.entitiesChange$.error(err);
        this.loading$.next(false);
        throw new Error(err.message);
      },
      () => this.entitiesChange$.complete(),
    );

    if (this.updateRouterState) {
      this.pageSubscription = this.route.queryParams.subscribe(
        (queryParams: Params) => {
          this.updateFromParameters(queryParams);
          this.loadData();
        },
      );
    } else {
      this.loadStateFromCookie();
      this.loadData();
    }
    this.evaluateDefaultView();
  }

  private hasTemplate(view: ViewRepresentation): boolean {
    return (
      (view === 'list' && !!this.listTemplate) ||
      (view === 'table' && !!this.tableTemplate) ||
      (view === 'thumbnail' && !!this.thumbnailTemplate)
    );
  }

  private evaluateDefaultView(): void {
    if (this.hasTemplate(this.defaultView)) {
      this.currentView = this.defaultView;
    } else if (this.listTemplate) {
      this.currentView = 'list';
    } else if (this.tableTemplate) {
      this.currentView = 'table';
    } else if (this.thumbnailTemplate) {
      this.currentView = 'thumbnail';
    }
  }

  updateFromParameters(queryParams: Params) {
    const parsed = UrlStateAdapter.parseParams(queryParams);
    this.n = parsed.n;
    this.limit = parsed.limit;
    this.sort = parsed.sort;
    this.filter = parsed.filter;
  }

  private loadStateFromCookie() {
    const state = this.cookiePersistence.loadState();
    if (state) {
      this.n = state.n ?? 0;
      this.limit = state.limit ?? 10;
      this.sort = state.sort ?? null;
      this.filter = new Map(state.filter ?? []);
    }
  }

  public loadData(): void {
    this.loading$.next(true);
    this.searchRequest$.next(this.searchRequest);
  }

  public refreshData(searchRequest?: SearchRequest, resetPages = true): void {
    if (resetPages) {
      this.n = 0;
    }
    if (searchRequest) {
      this.searchRequest = searchRequest;
    }
    this.saveAndUpdateData();
  }

  conditionalRouteUpdate(): Promise<boolean> {
    if (this.updateRouterState) {
      const extras = UrlStateAdapter.buildRouteParameters(
        this.n,
        this.limit,
        this.sort,
        this.filter,
        this.queryParamsMode,
        this.route,
      );
      // Get current active query parameters from the URL
      const currentParams = this.route.snapshot.queryParams;
      const newParams = extras.queryParams || {};

      // Check if the old and new query parameters are identical
      if (this.areParamsEqual(currentParams, newParams)) {
        return Promise.resolve(true);
      }
      return this.router.navigate([], extras);
    }
    return Promise.resolve(true);
  }

  // Helper method to deeply compare query parameter objects
  private areParamsEqual(params1: any, params2: any): boolean {
    const keys1 = Object.keys(params1);
    const keys2 = Object.keys(params2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      // Convert to strings to safely compare numbers/booleans from URL string types
      if (String(params1[key]) !== String(params2[key])) {
        return false;
      }
    }
    return true;
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

  public broadcastResults(page: PagedResourceCollection<T>): void {
    this.total = page.totalElements;
    this.limit = page.pageSize;
    this.error = undefined;
    this.loading$.next(false);
    this.entitiesChange$.next(page.resources);
  }

  setCurrentPage(event: PageEvent) {
    this.n = event.pageIndex;
    this.limit = event.pageSize;
    this.saveAndUpdateData();
  }

  setSort(sort: Sort) {
    if (sort?.direction) {
      this.sort = {
        [sort.active]: sort.direction.toUpperCase() as SortOrder,
      };
    } else {
      this.sort = null;
    }
    this.saveAndUpdateData();
  }

  setFilter(id?: string, value?: string) {
    if (id && value) {
      this.filter$.next(this.filter.set(id, value));
    } else {
      this.removeFilter(id);
    }
    this.refreshData(this.searchRequest, true);
  }

  removeFilter(id?: string) {
    if (id && this.filter.delete(id)) {
      this.filter$.next(this.filter);
      this.saveAndUpdateData();
    }
  }

  clearFilter() {
    this.filter = new Map<string, string>();
    this.filter$.next(this.filter);
    this.saveAndUpdateData();
  }

  trackEntity(entity: T): string {
    return entity.getSelfLinkHref();
  }

  setView(view: ViewRepresentation) {
    this.currentView = view;
  }

  private saveAndUpdateData() {
    if (this.updateRouterState) {
      this.conditionalRouteUpdate().then(() => {
        this.loadData();
      });
    } else {
      this.cookiePersistence.saveState(
        this.n,
        this.limit,
        this.sort,
        this.filter,
      );
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.pageSubscription?.unsubscribe();
    this.pipelineSubscription?.unsubscribe();
  }
}
