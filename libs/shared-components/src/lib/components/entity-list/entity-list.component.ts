import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedResourceCollection, Resource, Sort } from '@lagoshny/ngx-hateoas-client';
import { PageEvent } from '@angular/material/paginator';
import { SearchService } from "../../service/search.service";
import { Component, Inject, Input, OnInit, TemplateRef } from "@angular/core";

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.sass']
})
export class EntityListComponent<T extends Resource> implements OnInit {

  @Input() resultItemTemplate: TemplateRef<any> | undefined;

  @Input() table: boolean = false;

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

  // loading for the first time
  loading = true;

  // loading page - a smaller area to update
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
  }

  ngOnInit(): void {
    this.loading = this.entities.length <= 0
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

    this.pageLoading = true
    const subscriber = (page: PagedResourceCollection<T>) => {
      this.entities = page.resources;
      this.loading = false;
      this.pageLoading = false;
      this.total = page.totalElements;
      this.limit = page.pageSize;
    }

    return this.queryData().subscribe(subscriber)
  }

  queryData(): Observable<PagedResourceCollection<T>>  {
    return this.searchService.searchPage({
      pageParams: this.getPageParams(),
      sort: this.getSort(),
      useCache: this.getUseCache(),
      ...this.getQueryArguments()
    }, this.getQueryName())
  }

  getPageParams() {
    return {
      page: this.n,
      size: this.limit
    };
  }

  getQueryArguments(): any {}

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
