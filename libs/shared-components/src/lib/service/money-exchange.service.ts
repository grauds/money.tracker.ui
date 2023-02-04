import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HateoasService, SearchService } from "@clematis-shared/shared-components";
import { MoneyExchange, MoneyExchangeReport } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";
import { HttpClient } from "@angular/common/http";

//-- todo --
import { environment } from "../../../../../apps/money-tracker-ui/src/environments/environment";

@Injectable()
export class MoneyExchangeService extends SearchService<MoneyExchange> {

  constructor(private http: HttpClient, private hateoasService: HateoasService<MoneyExchange>) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string | undefined):
    Observable<PagedResourceCollection<MoneyExchange>> {
    return this.hateoasService.searchPage(options, queryName);
  }

  getExchangeReport(source: string, dest: string): Observable<MoneyExchangeReport> {

    return this.http.get<MoneyExchangeReport>(environment.apiUrl + '/exchange/search/report', {
      params: {
        source: source,
        dest: dest
      }
    })

  }

}
