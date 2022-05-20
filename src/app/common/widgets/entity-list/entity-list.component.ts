import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HateoasResourceService, PagedResourceCollection, Resource } from '@lagoshny/ngx-hateoas-client';

export abstract class EntityListComponent<T extends Resource> {

  path: string = '';

  // elements page
  entities: T[] = [];

  // total number of elements
  total: number | undefined;

  // current page number counter
  n: number = 1;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  // error message
  error: string | undefined;

  // offset from the start, offset = N * n, where N is a natural number
  offset: number = 0;

  // number of records per page
  limit: number = 10;

  loading: boolean = true;

  protected constructor(private type: new () => T,
                        private resourceService: HateoasResourceService,
                        private route: ActivatedRoute) {

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const page = Number.parseInt(queryParam['page'], 10)
        this.n = isNaN(page) ? 1 : page;
        this.onInit();
      }
    );
  }

  onInit(): void {
    this.loading = this.entities.length <= 0
    this.loadData()
  }

  setCurrentPage($event: number) {
    this.n = $event
    this.loadData()
  }

  loadData = () => {
    this.offset = this.n - 1
    return this.resourceService.getPage<T>(this.type, {
      pageParams: {
        page: this.offset,
        size: this.limit
      },
      sort: {
        name: 'ASC'
      }
    }).subscribe((page: PagedResourceCollection<T>) => {
      this.entities = page.resources;
      this.loading = false;
      this.total = page.totalElements;
      /* can use page methods
         page.first();
         page.last();
         page.next();
         page.prev();
         page.size(...);
         page.page(...);
         page.sortElements(...);
         page.customPage(...);
      */
    });
  }

}
