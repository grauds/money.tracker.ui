import { Observable, Subscription } from 'rxjs';
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Entity, SearchRequest } from '@clematis-shared/model';
import { PagedResourceCollection, Sort as RestSort, SortOrder } from '@lagoshny/ngx-hateoas-client';

import { SearchRequestHandler } from './search-request-handler';
import { UrlStateAdapter } from './url-state-adapter';

import { SearchService } from '../../service/search.service';
import { EntityListPersistenceService } from './entity-list-state-persistence';

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

interface EntityGridState {
  n: number;
  limit: number;
  sort: RestSort | null;
  filter: Map<string, string>;
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
  providers: [EntityListPersistenceService],
  standalone: false,
})
export class EntityListComponent<T extends Entity>
  implements OnInit, OnDestroy, OnChanges
{
  @Input() searchService!: SearchService<T>;
  @Input() searchServiceOverride?: SearchService<T>;

  @Input() defaultView: ViewRepresentation = 'list';
  @Input() currentView: ViewRepresentation = 'list';

  @Input() listTemplate?: TemplateRef<EntityTemplateContext<T>>;
  @Input() tableTemplate?: TemplateRef<EntityCollectionContext<T>>;
  @Input() thumbnailTemplate?: TemplateRef<EntityTemplateContext<T>>;
  @Input() entityName?: string | undefined;

  @Input() filterTemplate: TemplateRef<any> | undefined;

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

  loading = false;
  entities: T[] | null = [];
  total: number | undefined;
  error: string | undefined;

  gridState!: EntityGridState;

  private pageSubscription?: Subscription;
  private pipelineSubscription?: Subscription;

  public constructor(
    private readonly injector: Injector,
    private readonly persistenceService: EntityListPersistenceService,
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
    console.log('EntityList: Entering ngOnInit');
    this.resolveSearchService();

    this.persistenceService.configure({
      cookieKey: this.cookieStateKey,
      updateRouterState: this.updateRouterState,
      queryParamsMode: this.queryParamsMode,
    });

    const initial = this.persistenceService.getInitialState();
    this.gridState = {
      n: initial.n ?? this.gridState?.n ?? 0,
      limit: initial.limit ?? this.gridState?.limit ?? 10,
      sort: this.sort ?? initial.sort,
      filter: initial.filter,
    };
    console.log('EntityList: Loaded initial state', initial);

    this.pipelineSubscription = new SearchRequestHandler(
      this.searchService,
    ).createSearchPipeline(
      this.searchRequest$,
      () => {
        console.log('EntityList: pipeline current state builder triggered');
        return this.gridState;
      },
      (page) => {
        console.log('EntityList: pipeline search results received', page);
        this.broadcastResults(page);
      },
      (err) => {
        console.error('EntityList: pipeline search error caught', err);
        this.error = err.message;
        this.entitiesChange$.error(err);
        this.loading$.next(false);
        throw new Error(err.message);
      },
      () => {
        console.log('EntityList: pipeline search stream completed');
        this.entitiesChange$.complete();
      },
    );

    if (this.updateRouterState) {
      console.log(
        'EntityList: Router state updates are enabled. Subscribing to query parameters.',
      );
      this.pageSubscription = this.route.queryParams.subscribe(
        (queryParams: Params) => {
          console.log(
            'EntityList: Query parameters updated in browser. Parsing new states.',
          );
          const incoming = UrlStateAdapter.parseParams(queryParams);
          this.gridState = {
            n: incoming.n ?? this.gridState?.n ?? 0,
            limit: incoming.limit ?? this.gridState?.limit ?? 10,
            sort: incoming.sort ?? this.gridState?.sort ?? null,
            filter: incoming.filter,
          };

          this.loadData();
        },
      );
    } else {
      console.log(
        'EntityList: Router state updates are disabled. Falling back to cookie persistence.',
      );
      this.loadData();
    }
    this.evaluateDefaultView();
    console.log('EntityList: Exiting ngOnInit');
  }

  public broadcastResults(page: PagedResourceCollection<T>): void {
    console.log('EntityList: Broadcasting new results page data payload', page);
    this.total = page.totalElements;
    this.gridState.limit = page.pageSize;
    this.error = undefined;
    this.loading$.next(false);
    this.entitiesChange$.next(page.resources);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const fields: string[] = ['searchRequest', 'sort'];
    if (this.shouldReloadData(fields, changes)) {
      console.log('EntityList: ngOnChanges conditions met for reloading data');
      this.saveAndUpdateData();
    }
  }

  shouldReloadData(fields: string[], changes: SimpleChanges) {
    let shouldReload = false;
    for (const field of fields) {
      if (changes[field] && !changes[field].firstChange) {
        const prev = JSON.stringify(changes[field].previousValue);
        const curr = JSON.stringify(changes[field].currentValue);
        if (prev !== curr) {
          console.log(
            `EntityList: Detectable change found in field: "${field}". Old: ${prev}, New: ${curr}`,
          );
          shouldReload = true;
          break;
        }
      }
    }
    return shouldReload;
  }

  setCurrentPage(event: PageEvent) {
    console.log('EntityList: Page change event captured', event);
    this.gridState.n = event.pageIndex;
    this.gridState.limit = event.pageSize;
    this.saveAndUpdateData();
  }

  setSort(sort: Sort) {
    if (sort?.direction) {
      console.log('EntityList: Sort definition update captured', sort);
      this.sort = {
        [sort.active]: sort.direction.toUpperCase() as SortOrder,
      };
    } else {
      console.log('EntityList: Sort criteria was cleared', sort);
      this.sort = null;
    }
    this.saveAndUpdateData();
  }

  setFilter(idOrFilters: string | Record<string, string>, value?: string) {
    this.gridState.n = 0;
    let updatedFilter = this.gridState.filter;

    // Handle an object with multiple filters { filter1: v1, filter2: v2 }
    if (typeof idOrFilters === 'object' && idOrFilters !== null) {
      console.log(
        `EntityList: Applying multiple filter parameters`,
        idOrFilters,
      );

      Object.entries(idOrFilters).forEach(([id, val]) => {
        if (id && val) {
          updatedFilter = updatedFilter.set(id, val);
        }
      });
    }
    // Handle a single filter string ID and value pair
    else if (typeof idOrFilters === 'string' && value) {
      console.log(
        `EntityList: Applying filter parameter target - ID: ${idOrFilters}, Value: ${value}`,
      );
      updatedFilter = updatedFilter.set(idOrFilters, value);
    }
    // Invalid input, exit early
    else {
      console.log(`EntityList: No adjustments made for input`, {
        idOrFilters,
        value,
      });
      return;
    }

    // Save the modified filter back into the component state
    this.gridState.filter = updatedFilter;

    // Push the fresh filter to your stream and save it
    this.filter$.next(updatedFilter);
    console.log(`EntityList: sending updated filter to stream`, Object.fromEntries(updatedFilter));
    this.saveAndUpdateData();
  }

  removeFilter(id?: string) {
    if (id && this.gridState.filter.delete(id)) {
      this.gridState.n = 0;
      console.log(
        `EntityList: Filter item with mapping ID "${id}" successfully removed from configuration.`,
      );
      this.filter$.next(this.gridState.filter);
      this.saveAndUpdateData();
    } else {
      console.log(
        `EntityList: No adjustments made. Target removal item ID "${id}" was not found or was invalid.`,
      );
    }
  }

  clearFilter() {
    this.gridState.n = 0;
    console.log(
      'EntityList: Complete removal action triggered for all dynamic filters.',
    );
    this.gridState.filter = new Map<string, string>();
    this.filter$.next(this.gridState.filter);
    this.saveAndUpdateData();
  }

  public refreshData(searchRequest?: SearchRequest, resetPages = true): void {
    console.log('EntityList: refreshData requested', {
      searchRequest,
      resetPages,
    });

    let parsedState: any = null;
    if (searchRequest && searchRequest.queryArguments) {
      console.log('EntityList: Updating baseline search request reference');
      this.searchRequest = searchRequest;
      parsedState = UrlStateAdapter.parseParams(searchRequest.queryArguments);
    }

    const nextPage = resetPages
      ? 0
      : parsedState
        ? parsedState.n
        : this.gridState.n;
    if (resetPages) {
      console.log('EntityList: Resetting target page variable (n = 0)');
    }

    this.gridState = {
      n: nextPage,
      limit: parsedState ? parsedState.limit : this.gridState.limit,
      sort: parsedState ? parsedState.sort : this.gridState.sort,
      filter: parsedState ? parsedState.filter : this.gridState.filter,
    };

    this.saveAndUpdateData();
  }

  private saveAndUpdateData() {
    this.persistenceService
      .saveState(
        this.gridState.n,
        this.gridState.limit,
        this.sort ?? null,
        this.gridState.filter,
      )
      .then(() => {
        this.loadData();
      });
  }

  public loadData(): void {
    console.log(
      'EntityList: loadData routine executed. Pushing values to streams.',
    );
    this.loading$.next(true);
    this.searchRequest$.next(this.searchRequest);
  }

  private hasTemplate(view: ViewRepresentation): boolean {
    console.log(`EntityList: Checking if template exists for view: ${view}`);
    const hasIt =
      (view === 'list' && !!this.listTemplate) ||
      (view === 'table' && !!this.tableTemplate) ||
      (view === 'thumbnail' && !!this.thumbnailTemplate);
    console.log(`EntityList: Template check result for ${view} is ${hasIt}`);
    return hasIt;
  }

  private evaluateDefaultView(): void {
    console.log('EntityList: Evaluating default view strategy');
    if (this.hasTemplate(this.defaultView)) {
      this.currentView = this.defaultView;
    } else if (this.listTemplate) {
      this.currentView = 'list';
    } else if (this.tableTemplate) {
      this.currentView = 'table';
    } else if (this.thumbnailTemplate) {
      this.currentView = 'thumbnail';
    }
    console.log(
      `EntityList: Evaluated default view. Selected currentView: ${this.currentView}`,
    );
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

  getSelfLinkHref(entity: T): string {
    return entity.getSelfLinkHref();
  }

  setView(view: ViewRepresentation) {
    this.currentView = view;
  }

  ngOnDestroy(): void {
    this.pageSubscription?.unsubscribe();
    this.pipelineSubscription?.unsubscribe();
  }
}
