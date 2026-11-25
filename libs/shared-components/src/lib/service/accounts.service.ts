import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Account, AccountBalance, MonthlyBalanceSummary, MoneyType } from '@clematis-shared/model';
import { HttpClient } from '@angular/common/http';
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection,
  PagedGetOption
} from '@lagoshny/ngx-hateoas-client';
import { SearchService } from './search.service';
import { EnvironmentService } from './environment.service';

@Injectable()
export class AccountsService extends SearchService<Account> {
  constructor(
    private http: HttpClient,
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService,
  ) {
    super(environmentService);
  }

  searchPage(
    options: PagedGetOption | undefined,
    queryName: string,
  ): Observable<PagedResourceCollection<Account>> {
    return this.hateoasService.searchPage<Account>(Account, queryName, options);
  }

  getPage(
    options: PagedGetOption | undefined,
  ): Observable<PagedResourceCollection<Account>> {
    return this.hateoasService.getPage<Account>(Account, options);
  }

  getAccountsBalanceInCurrency(
    moneyType: MoneyType,
  ): Observable<ResourceCollection<AccountBalance>> {
    return this.hateoasService.searchCollection<AccountBalance>(
      AccountBalance,
      'code',
      {
        params: {
          code: moneyType.code,
        },
      },
    );
  }

  getAccountsTotalInCurrency(moneyType: MoneyType): Observable<number> {
    return this.http.get<number>(
      this.getUrl('/accountsTotals/search/balance'),
      {
        params: {
          code: moneyType.code,
        },
      },
    );
  }

  getAccountsTotalHistoryInCurrency(
    moneyType: MoneyType,
    days: number,
  ): Observable<number> {
    return this.http.get<number>(
      this.getUrl('/accountsTotals/search/balanceHistory'),
      {
        params: {
          code: moneyType.code,
          days: days,
        },
      },
    );
  }

  getBalance(an: number, mois: number, code: string): Observable<number> {
    return this.http.get<number>(this.getUrl('/monthlyDeltas/search/balance'), {
      params: {
        an: an,
        mois: mois,
        code: code,
      },
    });
  }

  getBalanceSummaryInCurrency(
    moneyType: MoneyType,
    moisStart: number,
    anStart: number,
    moisEnd: number,
    anEnd: number,
  ): Observable<ResourceCollection<MonthlyBalanceSummary>> {
    return this.http
      .get<any>(this.getUrl('/monthly/summary'), {
        params: {
          code: moneyType.code,
          moisStart,
          anStart,
          moisEnd,
          anEnd,
        },
      })
      .pipe(
        map((response) => {
          const collection = new ResourceCollection<MonthlyBalanceSummary>();
          const items = response?._embedded?.monthlyDeltas ?? [];
          collection.resources = items.map((item: any) =>
            Object.assign(new MonthlyBalanceSummary(), item),
          );
          return collection;
        }),
      );
  }
}
