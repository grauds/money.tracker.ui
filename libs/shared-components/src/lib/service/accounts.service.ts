import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account, MoneyType } from '@clematis-shared/model';
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
  ): Observable<ResourceCollection<Account>> {
    return this.hateoasService.searchCollection<Account>(Account, 'code', {
      params: {
        code: moneyType.code,
      },
    });
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
}
