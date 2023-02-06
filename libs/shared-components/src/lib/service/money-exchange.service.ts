import { Injectable } from '@angular/core';
import {Observable, of, switchMap} from "rxjs";
import { SearchService } from './search.service';
import {Entity, LastCommodity, MoneyExchange, MoneyExchangeReport} from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { HateoasResourceService, PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class MoneyExchangeService extends SearchService<MoneyExchange> {

  constructor(private http: HttpClient, private hateoasService: HateoasResourceService) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<MoneyExchange>> {

    return this.hateoasService.searchPage<MoneyExchange>(MoneyExchange, queryName, options);
  }

  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<MoneyExchange>> {
    return this.hateoasService.getPage<MoneyExchange>(MoneyExchange, options);
  }

  getExchangeReport(source: string, dest: string): Observable<MoneyExchangeReport> {

    return this.http.get<MoneyExchangeReport>(this.getUrl('/exchange/search/report'), {
      params: {
        source: source,
        dest: dest
      }
    })
  }

  getAverageExchangeRate(source: string, dest: string): Observable<number> {

    return this.http.get<number>(this.getUrl('/exchange/search/average'), {
      params: {
        source: source,
        dest: dest
      }
    })
  }
}
