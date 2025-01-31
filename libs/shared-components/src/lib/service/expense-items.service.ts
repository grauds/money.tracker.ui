import { Injectable } from '@angular/core';
import {
  AgentCommodities,
  Entity,
  ExpenseItem,
  MoneyType,
  Page,
} from '@clematis-shared/model';
import { PagedGetOption } from '@lagoshny/ngx-hateoas-client/lib/model/declarations';
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection,
} from '@lagoshny/ngx-hateoas-client';
import { Observable, of, switchMap } from 'rxjs';
import { SearchService } from './search.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable()
export class ExpenseItemsService extends SearchService<ExpenseItem> {
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
  ): Observable<PagedResourceCollection<ExpenseItem>> {
    return this.hateoasService
      .searchPage<ExpenseItem>(ExpenseItem, queryName, options)
      .pipe(this.postprocess());
  }

  getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<ExpenseItem>> {
    return this.hateoasService
      .getPage<ExpenseItem>(ExpenseItem, options)
      .pipe(this.postprocess());
  }

  postprocess() {
    return switchMap((arr: PagedResourceCollection<ExpenseItem>) => {
      arr.resources = arr.resources.map((expense: ExpenseItem) => {
        expense.commodityLink = Entity.getRelativeSelfLinkHref(
          expense.commodity
        );
        expense.tradeplaceLink = Entity.getRelativeSelfLinkHref(
          expense.tradeplace
        );
        return expense;
      });
      return of(arr);
    });
  }

  getCommodityExpences(
    commodityId: string
  ): Observable<ResourceCollection<ExpenseItem>> {
    if (commodityId) {
      return this.searchPage(
        {
          params: {
            commodityId: commodityId,
          },
        },
        'commodity'
      );
    }
    return of(new ResourceCollection<ExpenseItem>());
  }

  getOrganizationExpences(
    organizationId: string
  ): Observable<ResourceCollection<ExpenseItem>> {
    if (organizationId) {
      return this.hateoasService.searchPage<ExpenseItem>(
        ExpenseItem,
        'tradeplace',
        {
          params: {
            tradeplaceId: organizationId,
          },
        }
      );
    }
    return of(new ResourceCollection<ExpenseItem>());
  }

  getAgentExpencesInCurrency(
    currency: MoneyType,
    moisStart: number,
    anStart: number,
    moisEnd: number,
    anEnd: number
  ): Observable<Page<AgentCommodities>> {
    return this.http.get<Page<AgentCommodities>>(
      this.getUrl('/agentCommodityGroupExpenses'),
      {
        params: {
          code: currency.code,
          moisStart: moisStart,
          anStart: anStart,
          moisEnd: moisEnd,
          anEnd: anEnd,
        },
      }
    );
  }
}
