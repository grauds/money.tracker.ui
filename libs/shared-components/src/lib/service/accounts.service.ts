import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountBalance, MoneyType } from '@clematis-shared/model';
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
export class AccountsService extends SearchService<AccountBalance> {
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
  ): Observable<PagedResourceCollection<AccountBalance>> {
    return this.hateoasService.searchPage<AccountBalance>(
      AccountBalance,
      queryName,
      options
    );
  }

  getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<AccountBalance>> {
    return this.hateoasService.getPage<AccountBalance>(AccountBalance, options);
  }

  getAccountsBalanceInCurrency(
    moneyType: MoneyType
  ): Observable<ResourceCollection<AccountBalance>> {
    return this.hateoasService.searchCollection<AccountBalance>(
      AccountBalance,
      'code',
      {
        params: {
          code: moneyType.code,
        },
      }
    );
  }

  getAccountsTotalInCurrency(moneyType: MoneyType): Observable<number> {
    return this.http.get<number>(
      this.getUrl('/accountsTotals/search/balance'),
      {
        params: {
          code: moneyType.code,
        },
      }
    );
  }

  getAccountsTotalHistoryInCurrency(
    moneyType: MoneyType,
    days: number
  ): Observable<number> {
    return this.http.get<number>(
      this.getUrl('/accountsTotals/search/balanceHistory'),
      {
        params: {
          code: moneyType.code,
          days: days,
        },
      }
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
}
