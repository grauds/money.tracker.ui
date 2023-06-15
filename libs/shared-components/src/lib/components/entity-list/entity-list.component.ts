import { Observable, of, Subscription, switchMap, tap } from "rxjs";
import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Params, Router } from "@angular/router";
import { PageEvent } from '@angular/material/paginator';
import { Sort } from "@angular/material/sort";
import { Entity, SearchRequest } from "@clematis-shared/model";
import { PagedResourceCollection, Sort as RestSort, SortOrder } from "@lagoshny/ngx-hateoas-client";
import { PageParam } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { SearchService } from "../../service/search.service";

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.sass']
})
export class EntityListComponent<T extends Entity> implements OnInit {

  @Input() resultItemTemplate: TemplateRef<any> | undefined;

  @Input() filterTemplate: TemplateRef<any>  | undefined;

  @Input() table = false;

  @Input() sort: RestSort | null = null

  @Input() queryParamsMode: "merge" | "preserve" | "" | null = "merge";

  @Input() loadOnInit = true

  @Input() searchRequest?: SearchRequest;

  searchRequest$: EventEmitter<SearchRequest | undefined>
    = new EventEmitter<SearchRequest | undefined>();

  pageSubscription: Subscription;

  @Output() filter$: EventEmitter<Map<string, string>> = new EventEmitter<Map<string, string>>();

  filter: Map<string, string> = new Map<string, string>();

  @Output() statusDescription$: Observable<string> | undefined

  @Output() entities$: EventEmitter<T[]> = new EventEmitter<T[]>();

  entities: T[] | null = [];

  @Output() loading$: EventEmitter<boolean> = new EventEmitter<boolean>();

  loading = false;

  total: number | undefined;

  limit = 10;

  n = 0;

  error: string | undefined;

  public constructor(@Inject("searchService") private readonly searchService: SearchService<T>,
                     protected router: Router,
                     protected route: ActivatedRoute) {

    this.pageSubscription = route.queryParams.subscribe(
      (queryParams: Params) => {
        this.updateFromParameters(queryParams);
      }
    );

    this.entities$.subscribe((entities: T[] | null) => {
      this.entities = entities
    })

    this.loading$.subscribe((value:boolean) => {
      this.loading = value
    })
  }

  updateFromParameters(queryParams: Params) {

    // parse page, limit and sort information
    const page: number = Number.parseInt(queryParams["page"], 10);
    this.n = isNaN(page) ? 0 : page;

    const size: number = Number.parseInt(queryParams["size"], 10);
    this.limit = isNaN(size) ? 10 : size;

    const sort: string = queryParams["sort"];
    if (sort) {
      const s: string[] = sort.split(",");
      if (s.length === 2) {
        this.sort = { [s[0]]: s[1] as SortOrder };
      }
    }

    // add the rest of the url search parameters as filters
    Object.keys(queryParams).forEach((k) => {
      if (k !== "page" && k !== "size" && k !== "sort") {
        this.filter.set(k, queryParams[k]);
      }
    });
  }

  ngOnInit(): void {
    this.statusDescription$ = this.searchService.getStatusDescription()
    this.subscribeToSearchRequests()
    if (this.loadOnInit) {
      this.loadData()
    }
  }

  private loadData() {
    this.loading$.next(true)
    this.searchRequest$.next(this.searchRequest)
  }

  refreshData(searchRequest?: SearchRequest, resetPages: boolean = true) {
    if (resetPages) {
      this.n = 0
    }
    if (searchRequest) {
      this.searchRequest = searchRequest
    }
    this.updateRoute().then(() => {
      this.loadData()
    })
  }

  private subscribeToSearchRequests() {

    this.searchRequest$
      .pipe(
        tap(() => {
          this.searchService.setProcessingStatusDescription("search")
        }),
        switchMap((searchRequest: SearchRequest | undefined) => {

          const params = {
            pageParams: this.getPageParams(),
            sort: this.getSort(),
            useCache: this.getUseCache()
          }

          return (searchRequest && searchRequest.queryName) ?
            this.searchService.searchPage(
              {...params, params: {
                          ...searchRequest.queryArguments,
                          ...this.getFilterParams(),
                          ...searchRequest.filterParams
                      }
              },
              searchRequest.queryName
            ) :
            this.searchService.getPage(params)
        }),
        switchMap(this.executePostProcessing.bind(this)),
      )
      .subscribe({
        next: this.broadcastResults.bind(this),
        error: (err: Error) => {
          this.error = err.message
          this.entities$.error(err)
        },
        complete: () => {
          this.entities$.complete()
        }
      })
  }

  private broadcastResults(page: PagedResourceCollection<T>): void {

    this.total = page.totalElements;
    this.limit = page.pageSize;

    this.error = undefined
    this.loading$.next(false);
    this.entities$.next(page.resources);
  }

  private executePostProcessing(searchResult: PagedResourceCollection<T>): Observable<PagedResourceCollection<T>> {
    const handler = this.searchService.getPostProcessingStream()
    if (handler) {
      this.searchService.setProcessingStatusDescription("post processing")
      return handler(searchResult)
    }
    return of(searchResult)
  }

  updateRoute(): Promise<boolean> {
    return this.router.navigate([], this.getRouteParameters())
  }

  getRouteParameters(): NavigationExtras {
    let queryParams: Params = this.getPageParams()

    if (this.getSort()) {
      queryParams = { ...queryParams, ...this.getSortParams()}
    }

    if (this.getFilter()) {
      queryParams = { ...queryParams, ...this.getFilterParams()}
    }

    return {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: this.queryParamsMode,
      skipLocationChange: false
    }
  }

  getPageParams(): PageParam {
    return {
      page: this.n,
      size: this.limit
    };
  }

  setCurrentPage(event: PageEvent) {
    this.n = event.pageIndex
    this.limit = event.pageSize
    this.updateRoute().then(() => {
      this.loadData()
    })
  }

  getSort(): RestSort {
    return this.sort ? this.sort : {};
  }

  getSortParams(): Params | null {
    if (this.sort !== null) {
      return {
        sort: Object.keys(this.sort).map((k) => {
          return [k, this.sort !== null ? this.sort[k] : '']
        }).join(",")
      }
    }
    return null
  }

  setSort(sort: Sort) {
    if (sort && sort.direction) {
      this.sort = {
        [sort.active]: sort.direction.toUpperCase() as SortOrder
      }
    } else {
      this.sort = null
    }
    this.updateRoute().then(() => {
      this.loadData()
    })
  }

  getFilter(): Map<string, string> {
    return this.filter ? this.filter : new Map<string, string>();
  }

  getFilterParams(): Params | null {
    if (this.filter !== null) {
      const queryParams: Params = {};
      this.filter.forEach((value, key) => {
        queryParams[key] = value;
      });
      return queryParams
    }
    return null
  }

  setFilter(id? : string,  value? : string) {
    if (id && value) {
      this.filter$.next(this.filter.set(id, value))
    } else {
      this.filter$.next(this.filter)
    }
  }

  removeFilter(id: string) {
    if (this.filter.delete(id)) {
      this.filter$.next(this.filter)
    }
  }

  clearFilter() {
    this.filter = new Map<string, string>
    this.filter$.next(this.filter)
  }

  getUseCache(): boolean {
    return true
  }
}
