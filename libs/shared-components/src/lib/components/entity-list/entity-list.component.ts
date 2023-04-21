import { Observable, of, Subscription, switchMap, tap } from "rxjs";
import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Params, Router } from "@angular/router";
import { PageEvent } from '@angular/material/paginator';
import { Sort } from "@angular/material/sort";
import { Entity, SearchRequest } from "@clematis-shared/model";
import { PagedResourceCollection, RequestParam, Sort as RestSort, SortOrder } from "@lagoshny/ngx-hateoas-client";
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

  @Input() queryParamsMode: "merge" | "preserve" | "" | null = "";

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  @Output() filter$: EventEmitter<Map<string, string>> = new EventEmitter<Map<string, string>>();

  filter: Map<string, string> = new Map<string, string>();

  @Output() statusDescription$: Observable<string> | undefined

  searchRequest$: EventEmitter<SearchRequest> = new EventEmitter<SearchRequest>();

  total: number | undefined;

  limit = 10;

  n = 0;

  @Output() entities$: EventEmitter<T[]> = new EventEmitter<T[]>();

  entities: T[] | null = [];

  @Output() loading$: EventEmitter<boolean> = new EventEmitter<boolean>();

  loading = false;

  error: string | undefined;

  public constructor(@Inject("searchService") private readonly searchService: SearchService<T>,
                     protected router: Router,
                     protected route: ActivatedRoute) {

    this.pageSubscription = route.queryParams.subscribe(
      (queryParams: Params) => {

        // parse page, limit and sort information
        const page: number = Number.parseInt(queryParams['page'], 10)
        this.n = isNaN(page) ? 0 : page;

        const size: number = Number.parseInt(queryParams['size'], 10)
        this.limit = isNaN(size) ? 10 : size;

        const sort: string = queryParams['sort']
        if (sort) {
          const s: string[] = sort.split(',')
          if (s.length === 2) {
            this.sort = { [s[0]] : s[1] as SortOrder }
          }
        }
      }
    );

    this.entities$.subscribe((entities: T[] | null) => {
      this.entities = entities
    })

    this.loading$.subscribe((value:boolean) => {
      this.loading = value
    })
  }

  ngOnInit(): void {
    this.statusDescription$ = this.searchService.getStatusDescription()
    this.subscribeToSearchRequests()
    this.loadData()
  }

  loadData() {
    this.loading$.next(true)
    this.searchRequest$.next({...this.queryArguments, ...this.getFilterParams()})
  }

  private subscribeToSearchRequests() {

    const params = {
      pageParams: this.getPageParams(),
      sort: this.getSort(),
      useCache: this.getUseCache()
    }

    this.searchRequest$
      .pipe(
      //tap(this.searchRequestWasStarted.bind(this)),
        tap(() => {
          this.searchService.setProcessingStatusDescription("search")
        }),
        switchMap((request: SearchRequest) => {
          console.log("Using query name " + this.queryName);
          console.log("Using query params " + JSON.stringify(request));
          return (request.queryName) ?
            this.searchService.searchPage(
              {...params, params: request.queryArguments},
              this.queryName
            )
            : this.searchService.getPage(params)
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

  updateRoute() {
    this.router.navigate([], this.getRouteParameters())
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
    this.updateRouteAndLoadData()
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
    this.updateRouteAndLoadData()
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

  submitAction() {
    this.filter$.next(this.filter)
  }

  setFilter(id : string,  value : string) {
    this.filter$.next(this.filter.set(id, value))
  }

  removeFilter(id: string) {
    if (this.filter.delete(id)) {
      this.filter$.next(this.filter)
    }
  }

  clearFilters() {
    this.filter = new Map<string, string>
    this.filter$.next(this.filter)
  }

  clearFiltersAction() {
    this.clearFilters()
  }

  updateRouteAndLoadData() {
    this.updateRoute()
    this.loadData()
  }

  getUseCache(): boolean {
    return true
  }
}
