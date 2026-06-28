import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection,
  PagedGetOption
} from '@lagoshny/ngx-hateoas-client';
import { Observable, of } from 'rxjs';

import { CommodityGroup, MoneyType } from '@clematis-shared/model';
import { EnvironmentService } from './environment.service';
import { SearchService } from './search.service';

@Injectable()
export class CommodityGroupService extends SearchService<CommodityGroup> {
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
  ): Observable<PagedResourceCollection<CommodityGroup>> {
    return this.hateoasService.searchPage<CommodityGroup>(
      CommodityGroup,
      queryName,
      options
    );
  }

  getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<CommodityGroup>> {
    return this.hateoasService.getPage<CommodityGroup>(CommodityGroup, options);
  }

  getPath(
    commodityGroupId: string | null
  ): Observable<ResourceCollection<CommodityGroup>> {
    if (commodityGroupId) {
      return this.hateoasService.searchCollection<CommodityGroup>(
        CommodityGroup,
        'pathById',
        {
          params: {
            id: commodityGroupId,
          },
        }
      );
    }
    return of(new ResourceCollection<CommodityGroup>());
  }

  getTotals(
    commodityGroupId: string | null,
    moneyCode: MoneyType
  ): Observable<number> {
    if (commodityGroupId) {
      return this.http.get<number>(
        this.getUrl('/expenses/search/sumCommodityGroupExpenses'),
        {
          params: {
            commodityGroupId: commodityGroupId,
            moneyCode: moneyCode.code,
          },
        }
      );
    }
    return of(0);
  }
}
