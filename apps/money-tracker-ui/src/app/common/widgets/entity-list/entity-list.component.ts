import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
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

  // current page number counter
  n: number = 0;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  // error message
  error: string | undefined;

  // number of records per page
  limit: number = 10;

  // loading for the first time
  loading: boolean = true;

  // loading page - a smaller area to update
  pageLoading: boolean = false;

  // search string to filter the list of entities by the names
  search: string = '';

  protected constructor(private type: new () => T,
                        private resourceService: HateoasResourceService,
                        private route: ActivatedRoute,
                        renderer: any = new EntityElementComponent()) {

    this.renderer = renderer

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
    this.loadData()
  }

  setSearchString($event: string) {
    this.search = $event
    this.loadData()
  }

  loadData = () => {
    this.pageLoading = true
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
      }).subscribe((page: PagedResourceCollection<T>) => {
        this.entities = page.resources;
        this.loading = false;
        this.pageLoading = false;
        this.total = page.totalElements;
        this.limit = page.pageSize;
      })
    } else {
      return this.resourceService.getPage<T>(this.type, {
        pageParams: {
          page: this.n,
          size: this.limit
        },
        sort: this.getSortOption()
      }).subscribe((page: PagedResourceCollection<T>) => {
        this.entities = page.resources;
        this.loading = false;
        this.pageLoading = false;
        this.total = page.totalElements;
        this.limit = page.pageSize;
      });
    }
  }

  getSortOption() {
    let ret: Sort = {
      name: 'ASC'
    }

    return ret
  }

}
