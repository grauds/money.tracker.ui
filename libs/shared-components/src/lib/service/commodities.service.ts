import { Injectable } from '@angular/core';
import { Commodity } from '@clematis-shared/model';
import {
  HateoasResourceService,
  PagedResourceCollection,
  PagedGetOption
} from '@lagoshny/ngx-hateoas-client';
import { Observable, of } from 'rxjs';
import { SearchService } from './search.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable()
export class CommoditiesService extends SearchService<Commodity> {
  constructor(
    private http: HttpClient,
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService
  ) {
    super(environmentService);
  }

  searchPage(
    options: PagedGetOption | undefined,
    queryName: string
  ): Observable<PagedResourceCollection<Commodity>> {
    return this.hateoasService.searchPage<Commodity>(
      Commodity,
      queryName,
      options
    );
  }

  getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<Commodity>> {
    return this.hateoasService.getPage<Commodity>(Commodity, options);
  }

  getTotalQtyForCommodity(commodityId: string | null): Observable<number> {
    if (commodityId) {
      return this.http.get<number>(
        this.getUrl('/expenseItems/search/sumCommodityQuantity'),
        {
          params: {
            id: commodityId,
          },
        }
      );
    }
    return of(0);
  }
}
