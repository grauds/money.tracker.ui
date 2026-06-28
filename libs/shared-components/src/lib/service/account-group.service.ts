import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection,
  PagedGetOption
} from '@lagoshny/ngx-hateoas-client';
import { Observable, of } from 'rxjs';

import { AccountGroup, MoneyType } from '@clematis-shared/model';
import { EnvironmentService } from './environment.service';
import { SearchService } from './search.service';

@Injectable()
export class AccountGroupService extends SearchService<AccountGroup> {
  constructor(
    private http: HttpClient,
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService,
  ) {
    super(environmentService);
  }

  override searchPage(
    options: PagedGetOption | undefined,
    queryName: string,
  ): Observable<PagedResourceCollection<AccountGroup>> {
    return this.hateoasService.searchPage<AccountGroup>(
      AccountGroup,
      queryName,
      options,
    );
  }

  override getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<AccountGroup>> {
    return this.hateoasService.getPage<AccountGroup>(AccountGroup, options);
  }

  getPath(
    accountGroupId: string | null
  ): Observable<ResourceCollection<AccountGroup>> {
    if (accountGroupId) {
      return this.hateoasService.searchCollection<AccountGroup>(
        AccountGroup,
        'pathById',
        {
          params: {
            id: accountGroupId,
          },
        },
      );
    }
    return of(new ResourceCollection<AccountGroup>());
  }

  getTotals(
    accountGroupId: string | null,
    moneyCode: MoneyType,
  ): Observable<number> {
    if (accountGroupId) {
      return this.http.get<number>(
        this.getUrl('/expenses/search/sumAccountGroupExpenses'),
        {
          params: {
            accountGroupId: accountGroupId,
            moneyCode: moneyCode.code,
          },
        },
      );
    }
    return of(0);
  }
}
