import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedResourceCollection, Sort } from '@lagoshny/ngx-hateoas-client';
import { PageEvent } from '@angular/material/paginator';
import { SearchService } from "../../service/search.service";
import {Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef} from "@angular/core";
import { Entity } from "@clematis-shared/model";

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.sass']
})
export class EntityListComponent<T extends Entity> implements OnInit {

  @Input() resultItemTemplate: TemplateRef<any> | undefined;

  @Input() table = false;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  // elements page
  entities: T[] = [];

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
  }

  ngOnInit(): void {
    this.loading$.next(this.entities.length <= 0)
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

  loadData(): Subscription {

    this.pageLoading$.next(true)
    const subscriber = (page: PagedResourceCollection<T>) => {
      this.entities = page.resources;
      this.loading$.next(false);
      this.pageLoading$.next(false);
      this.total = page.totalElements;
      this.limit = page.pageSize;
    }

    return this.queryData().subscribe(subscriber)
  }

  queryData(): Observable<PagedResourceCollection<T>>  {
    if (this.getQueryName()) {
      return this.searchService.searchPage({
        pageParams: this.getPageParams(),
        sort: this.getSort(),
        useCache: this.getUseCache(),
        ...this.getQueryArguments()
      }, this.getQueryName())
    } else {
      return this.searchService.getPage({
        pageParams: this.getPageParams(),
        sort: this.getSort(),
        useCache: this.getUseCache(),
        ...this.getQueryArguments()
      })
    }
  }

  getPageParams() {
    return {
      page: this.n,
      size: this.limit
    };
  }

  getQueryArguments(): object {
    return {}
  }

  getQueryName(): string | null {
    return null;
  }

  getSort(): Sort {
    return {
      name: 'ASC'
    }
  }

  getUseCache(): boolean {
    return true
  }
}
