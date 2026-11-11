import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EnvironmentService } from './environment.service';
import { ExpenseByCurrency, ExpenseItem } from '@clematis-shared/model';
import { SearchService } from './search.service';
import {
  HateoasResourceService,
  PagedGetOption,
  PagedResourceCollection,
} from '@lagoshny/ngx-hateoas-client';

@Injectable()
export class ExpenseService extends SearchService<ExpenseItem> {
  constructor(
    private http: HttpClient,
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService,
  ) {
    super(environmentService);
  }

  getPage(
    options: PagedGetOption | undefined,
  ): Observable<PagedResourceCollection<ExpenseItem>> {
    return this.hateoasService.getPage<ExpenseItem>(ExpenseItem, options);
  }

  searchPage(
    options: PagedGetOption | undefined,
    queryName: string,
  ): Observable<PagedResourceCollection<ExpenseItem>> {
    return this.hateoasService.searchPage<ExpenseItem>(
      ExpenseItem,
      queryName,
      options,
    );
  }

  total(code: string): Observable<number> {
    return this.http.get<number>(this.getUrl('/expenses/search/total'), {
      params: { code },
    });
  }

  totalByCurrency(code: string): Observable<ExpenseByCurrency[]> {
    return this.http.get<ExpenseByCurrency[]>(
      this.getUrl('/expenses/search/totalByCurrency'),
      {
        params: { code },
      },
    );
  }
}
