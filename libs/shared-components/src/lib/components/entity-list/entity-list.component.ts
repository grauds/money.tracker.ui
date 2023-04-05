import { BehaviorSubject, Observable, of, Subscription, switchMap, tap } from "rxjs";
import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Params, Router } from "@angular/router";
import { PageEvent } from '@angular/material/paginator';
import { Sort } from "@angular/material/sort";
import { Entity } from "@clematis-shared/model";
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

  @Input() queryName: string | null = null;

  @Input() queryArguments: RequestParam = {};

  @Input() sort: RestSort | null = null

  @Input() queryParamsMode: "merge" | "preserve" | "" | null = "";

  filter: Map<string, string> = new Map<string, string>();

  statusDescription$: Observable<string> | undefined

  searchRequest$ = new BehaviorSubject<RequestParam>(this.queryArguments)

  entities: T[] | null = [];

  total: number | undefined;

  // number of records per page
  limit = 10;

  // current page number counter
  n = 0;

  @Output() entities$ = new EventEmitter<T[]>();

  @Output() pageLoading$ = new EventEmitter<boolean>();

  // loading page - a smaller area to update
  @Output() loading$ = new EventEmitter<boolean>();

  @Output() filter$ = new EventEmitter<Map<string, string>>();

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  // error message
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

        // add the rest of the url search parameters as filters
        Object.keys(queryParams).forEach((k) => {
          if (k !== 'page' && k !== 'size' && k !== 'sort') {
            this.filter.set(k, queryParams[k])
          }
        })
      }
    );

    this.entities$.subscribe((entities: T[] | null) => {
      this.entities = entities
    })

    this.subscribeToSearchRequests()

  }

  ngOnInit(): void {

    this.filter$.next(this.filter)
    this.statusDescription$ = this.searchService.getStatusDescription()
    this.pageLoading$.next(true)

    this.loadData()
  }

  loadData() {
    this.loading$.next(true)
    this.searchRequest$.next({...this.queryArguments, ...this.getFilterParams()})
  }

  private subscribeToSearchRequests() {
    this.searchRequest$
      .pipe(
      //tap(this.searchRequestWasStarted.bind(this)),
        tap(() => {
          this.searchService.setProcessingStatusDescription("search")
        }),
        switchMap((state: RequestParam) =>
          this.queryName
            ? this.searchService.searchPage({
              pageParams: this.getPageParams(),
              sort: this.getSort(),
              useCache: this.getUseCache(),
              params: state
            }, this.queryName)
            : this.searchService.getPage({
              pageParams: this.getPageParams(),
              sort: this.getSort(),
              useCache: this.getUseCache(),
              params: state
            })),
        switchMap(this.executePostProcessing.bind(this)),
      )
      .subscribe({
        next: this.broadcastResults.bind(this),
        error: (err: Error) => this.entities$.error(err),
        complete: () => this.entities$.complete()
      })
  }

  private broadcastResults(page: PagedResourceCollection<T>): void {

    this.total = page.totalElements;
    this.limit = page.pageSize;

    this.loading$.next(false);
    this.pageLoading$.next(false);
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

  getSort(): RestSort {
    return this.sort ? this.sort : {};
  }

  getFilter(): Map<string, string> {
    return this.filter ? this.filter : new Map<string, string>();
  }

  setCurrentPage(event: PageEvent) {
    this.n = event.pageIndex
    this.limit = event.pageSize
    this.startLoadingData()
  }

  setSort(sort: Sort) {
    if (sort && sort.direction) {
      this.sort = {
        [sort.active]: sort.direction.toUpperCase() as SortOrder
      }
    } else {
      this.sort = null
    }
    this.startLoadingData()
  }

  startLoadingData() {
    this.updateRoute()
    this.loadData()
  }

  setFilter(id : string,  value : string) {
    this.filter$.next(this.filter.set(id, value))
  }

  getUseCache(): boolean {
    return true
  }

  removeFilter(id: string) {
    if (this.filter.delete(id)) {
      this.filter$.next(this.filter)
    }
  }
}
