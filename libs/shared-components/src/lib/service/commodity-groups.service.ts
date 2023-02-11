import { Injectable } from '@angular/core';
import { SearchService } from './search.service';
import { CommodityGroup, MoneyTypes } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { Observable, of } from "rxjs";
import { HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection
} from "@lagoshny/ngx-hateoas-client";
import { HttpClient } from "@angular/common/http";
import { EnvironmentService } from "./environment.service";

@Injectable()
export class CommodityGroupsService extends SearchService<CommodityGroup> {

  constructor(private http: HttpClient,
              private hateoasService: HateoasResourceService,
              override environmentService: EnvironmentService) {
    super(environmentService);
  }


  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<CommodityGroup>> {
    return this.hateoasService.searchPage<CommodityGroup>(CommodityGroup, queryName, options);
  }

  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<CommodityGroup>> {
    return this.hateoasService.getPage<CommodityGroup>(CommodityGroup, options);
  }

  getPathForCommodityGroup(commodityGroupId: string | null):
    Observable<ResourceCollection<CommodityGroup>> {

    if (commodityGroupId) {
      return this.hateoasService.searchCollection<CommodityGroup>(CommodityGroup,'pathById', {
        params: {
          id: commodityGroupId
        }
      })
    }
    return of(new ResourceCollection<CommodityGroup>())
  }

  getTotalsForCommodityGroup(commodityGroupId: string | null,
                             moneyCode: MoneyTypes): Observable<number> {

    if (commodityGroupId) {
      return this.http.get<number>(this.getUrl('/expenses/search/sumCommodityGroupExpenses'), {
        params: {
          commodityGroupId: commodityGroupId,
          moneyCode: moneyCode
        }
      })
    } return of(0)
  }

}
