import { Injectable } from '@angular/core';
import { Commodity, MoneyTypes } from "@clematis-shared/model";
import { HateoasResourceService, PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { Observable, of } from "rxjs";
import { SearchService } from './search.service';
import { HttpClient } from "@angular/common/http";
import { EnvironmentService } from "./environment.service";

@Injectable()
export class CommoditiesService extends SearchService<Commodity> {

  constructor(private http: HttpClient,
              private hateoasService: HateoasResourceService,
              override environmentService: EnvironmentService) {
    super(environmentService);
  }


  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<Commodity>> {
    return this.hateoasService.searchPage<Commodity>(Commodity, queryName, options);
  }

  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<Commodity>> {
    return this.hateoasService.getPage<Commodity>(Commodity, options);
  }

  getTotalsForCommodity(commodityId: string | null,
                        moneyCode: MoneyTypes) {

    if (commodityId) {
      return this.http.get<number>(this.getUrl('/expenseItems/search/sumCommodityExpenses'), {
        params: {
          commodityId: commodityId,
          moneyCode: moneyCode
        }
      })
    } return of(0)
  }

  getTotalQtyForCommodity(commodityId: string | null): Observable<number>  {

    if (commodityId) {
      return this.http.get<number>(this.getUrl('/expenseItems/search/sumCommodityQuantity'), {
        params: {
          commodityId: commodityId
        }
      })
    } return of(0)
  }
}
