import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchService } from './search.service';
import {
  MoneyExchange,
  MoneyExchangeReport,
  MoneyType,
} from '@clematis-shared/model';
import {
  HateoasResourceService,
  PagedResourceCollection,
  PagedGetOption
} from '@lagoshny/ngx-hateoas-client';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable()
export class MoneyExchangeService extends SearchService<MoneyExchange> {
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
  ): Observable<PagedResourceCollection<MoneyExchange>> {
    return this.hateoasService.searchPage<MoneyExchange>(
      MoneyExchange,
      queryName,
      options
    );
  }

  getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<MoneyExchange>> {
    return this.hateoasService.getPage<MoneyExchange>(MoneyExchange, options);
  }

  getExchangeReport(
    source: MoneyType,
    dest: MoneyType
  ): Observable<MoneyExchangeReport> {
    return this.http.get<MoneyExchangeReport>(
      this.getUrl('/exchange/search/report'),
      {
        params: {
          source: source.code,
          dest: dest.code,
        },
      }
    );
  }

  getAverageExchangeRate(
    source: MoneyType,
    dest: MoneyType
  ): Observable<number> {
    return this.http.get<number>(this.getUrl('/exchange/search/average'), {
      params: {
        source: source.code,
        dest: dest.code,
      },
    });
  }
}
