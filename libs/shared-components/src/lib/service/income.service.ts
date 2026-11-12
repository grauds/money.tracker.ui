import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EnvironmentService } from './environment.service';
import {
  CategoryAmountItem,
  IncomeByCurrency,
  IncomeItem,
} from '@clematis-shared/model';
import { SearchService } from './search.service';
import {
  HateoasResourceService,
  PagedGetOption,
  PagedResourceCollection,
} from '@lagoshny/ngx-hateoas-client';

@Injectable()
export class IncomeService extends SearchService<IncomeItem> {
  constructor(
    private http: HttpClient,
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService,
  ) {
    super(environmentService);
  }

  getPage(
    options: PagedGetOption | undefined,
  ): Observable<PagedResourceCollection<IncomeItem>> {
    return this.hateoasService.getPage<IncomeItem>(IncomeItem, options);
  }

  searchPage(
    options: PagedGetOption | undefined,
    queryName: string,
  ): Observable<PagedResourceCollection<IncomeItem>> {
    return this.hateoasService.searchPage<IncomeItem>(
      IncomeItem,
      queryName,
      options,
    );
  }

  total(code: string): Observable<number> {
    return this.http.get<number>(this.getUrl('/income/search/total'), {
      params: { code },
    });
  }

  totalByCurrency(code: string): Observable<IncomeByCurrency[]> {
    return this.http.get<IncomeByCurrency[]>(
      this.getUrl('/income/search/totalByCurrency'),
      {
        params: { code },
      },
    );
  }

  totalByOrganizations(code: string): Observable<CategoryAmountItem[]> {
    return this.http.get<CategoryAmountItem[]>(
      this.getUrl('/income/search/totalByOrganizations'),
      {
        params: { code }
      },
    );
  }
}
