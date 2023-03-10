import { BehaviorSubject, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedResourceCollection, RequestParam, Sort } from '@lagoshny/ngx-hateoas-client';
import { PageEvent } from '@angular/material/paginator';
import { SearchService } from "../../service/search.service";
import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef } from "@angular/core";
import { Entity } from "@clematis-shared/model";
import { PageParam } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.sass']
})
export class EntityListComponent<T extends Entity> implements OnInit {

  @Input() resultItemTemplate: TemplateRef<any> | undefined;

  @Input() table = false;

  @Input() queryArguments: RequestParam = {};

  searchRequest$ = new BehaviorSubject<RequestParam>(this.queryArguments)

  @Input() queryName: string | null = null;

  @Input() sort: Sort = {
    name: 'ASC'
  }

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  // elements page
  entities: T[] | null = [];

  @Output() entities$ = new EventEmitter<T[]>();

  // total number of elements
  total: number | undefined;

  // number of records per page
  limit = 10;

  // current page number counter
  n = 0;

  @Output() loading$ = new EventEmitter<boolean>();

  loading = false;

  // loading page - a smaller area to update
  @Output() pageLoading$ = new EventEmitter<boolean>();

  pageLoading = false;

  // error message
  error: string | undefined;

  public constructor(@Inject("searchService") private readonly searchService: SearchService<T>,
                     protected router: Router,
                     protected route: ActivatedRoute) {

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const page = Number.parseInt(queryParam['page'], 10)
        this.n = isNaN(page) ? 0 : page;
        const size = Number.parseInt(queryParam['size'], 10)
        this.limit = isNaN(size) ? 10 : size;
      }
    );

    this.loading$.subscribe((flag: boolean) => {
      this.loading = flag
    })

    this.pageLoading$.subscribe((flag: boolean) => {
      this.pageLoading = flag
    })

    this.entities$.subscribe((entities: T[] | null) => {
      this.entities = entities
    })
  }

  ngOnInit(): void {
    this.pageLoading$.next(true)
    this.handleSearchRequests()
    this.loadData()
  }

  setCurrentPage(event: PageEvent) {
    this.n = event.pageIndex
    this.limit = event.pageSize
    this.updateRoute()
    this.loadData()
  }

  updateRoute() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.getPageParams(),
      queryParamsHandling: 'merge',
      skipLocationChange: false
    })
  }

  private handleSearchRequests() {
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
              ...state
            })),
        switchMap(this.executePostProcessing.bind(this)),
      )
      .subscribe({
        next: this.processSearchRequestResult.bind(this),
        error: (err: Error) => this.entities$.error(err),
        complete: () => this.entities$.complete()
      })
  }

  private processSearchRequestResult(page: PagedResourceCollection<T>): void {

    this.total = page.totalElements;
    this.limit = page.pageSize;

    this.loading$.next(false);
    this.pageLoading$.next(false);
    this.entities$.next(page.resources)
  }

  private executePostProcessing(searchResult: PagedResourceCollection<T>): Observable<PagedResourceCollection<T>> {
    const handler = this.searchService.getPostProcessingStream()
    if (handler) {
      this.searchService.setProcessingStatusDescription("post processing")
      return handler(searchResult)
    }
    return of(searchResult)
  }

  loadData() {
    this.loading$.next(true)
    this.searchRequest$.next(this.queryArguments)
  }

  getPageParams(): PageParam {
    return {
      page: this.n,
      size: this.limit
    };
  }

  getSort(): Sort {
    return this.sort
  }

  getUseCache(): boolean {
    return true
  }
}
