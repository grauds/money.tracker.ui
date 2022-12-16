import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HateoasResourceService, PagedResourceCollection, Resource, Sort } from '@lagoshny/ngx-hateoas-client';
import { EntityElementComponent } from '../entity-element/entity-element.component';
import { PageEvent } from '@angular/material/paginator';

export abstract class EntityListComponent<T extends Resource> {

  path: string = '';

  // elements page
  entities: T[] = [];

  // entity renderer
  renderer: EntityElementComponent;

  // total number of elements
  total: number | undefined;

  // number of records per page
  limit: number = 10;

  // current page number counter
  n: number = 0;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  // error message
  error: string | undefined;

  // loading for the first time
  loading: boolean = true;

  // loading page - a smaller area to update
  pageLoading: boolean = false;

  // search string to filter the list of entities by the names
  search: string = '';

  protected constructor(private type: new () => T,
                        protected resourceService: HateoasResourceService,
                        private router: Router,
                        private route: ActivatedRoute,
                        renderer?: any) {

    this.renderer = renderer ? renderer : new EntityElementComponent(router)

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const page = Number.parseInt(queryParam['page'], 10)
        this.n = isNaN(page) ? 0 : page;
        const size = Number.parseInt(queryParam['size'], 10)
        this.limit = isNaN(size) ? 10 : size;
        this.onInit();
      }
    );
  }

  onInit(): void {
    this.loading = this.entities.length <= 0
    this.loadData()
  }

  setCurrentPage(event: PageEvent) {
    this.n = event.pageIndex
    this.limit = event.pageSize
    this.updateRoute()
    this.loadData()
  }

  setSearchString($event: string) {
    this.search = $event
    this.loadData()
  }

  updateRoute() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.n,
        size: this.limit
      },
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
    if (this.search) {
      return this.resourceService.searchPage<T>(this.type, 'findByNameStarting',{
        pageParams: {
          page: this.n,
          size: this.limit
        },
        params: {
          name: this.search
        },
        sort: this.getSortOption()
      })
    } else {
      return this.resourceService.getPage<T>(this.type, {
        pageParams: {
          page: this.n,
          size: this.limit
        },
        sort: this.getSortOption()
      })
    }
  }

  getSortOption() {
    let ret: Sort = {
      name: 'ASC'
    }
    return ret
  }

}
