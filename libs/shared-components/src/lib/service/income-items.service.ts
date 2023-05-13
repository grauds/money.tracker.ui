import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection
} from "@lagoshny/ngx-hateoas-client";
import { PagedGetOption } from '@lagoshny/ngx-hateoas-client/lib/model/declarations';

import {
  Entity,
  IncomeItem,
  MoneyType,
  IncomeMonthly
} from '@clematis-shared/model';

import { SearchService } from './search.service';
import { EnvironmentService } from './environment.service';

@Injectable()
export class IncomeItemsService extends SearchService<IncomeItem> {

  constructor(private http: HttpClient,
              private hateoasService: HateoasResourceService,
              override environmentService: EnvironmentService) {
    super(environmentService);
  }


  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<IncomeItem>> {
    return this.hateoasService.getPage<IncomeItem>(IncomeItem, options).pipe(
      this.postprocess()
    )
  }

  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<IncomeItem>> {

    return this.hateoasService.searchPage<IncomeItem>(IncomeItem, queryName, options).pipe(
      this.postprocess()
    )
  }

  postprocess() {
    return switchMap((arr: PagedResourceCollection<IncomeItem>) => {
      arr.resources = arr.resources.map((income: IncomeItem) => {
        income.commodityLink = Entity.getRelativeSelfLinkHref(income.commodity)
        income.tradeplaceLink = Entity.getRelativeSelfLinkHref(income.tradeplace)
        return income
      })
      return of(arr)
    });
  }

  getIncomeInCurrency(currency: MoneyType,
                      moisStart: number,
                      anStart: number,
                      moisEnd: number,
                      anEnd: number):
    Observable<ResourceCollection<IncomeMonthly>> {

    return this.hateoasService.searchCollection<IncomeMonthly>
    (IncomeMonthly, 'report', {
      params: {
        code: currency.code,
        moisStart: moisStart,
        anStart: anStart,
        moisEnd: moisEnd,
        anEnd: anEnd
      }
    })
  }
}
