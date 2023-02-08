import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AccountBalance } from "@clematis-shared/model";
import { HttpClient} from "@angular/common/http";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection
} from "@lagoshny/ngx-hateoas-client";
import { SearchService } from './search.service';

@Injectable()
export class AccountsService extends SearchService<AccountBalance> {

  constructor(private http: HttpClient, private hateoasService: HateoasResourceService) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<AccountBalance>> {
    return this.hateoasService.searchPage<AccountBalance>(AccountBalance, queryName, options);
  }

  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<AccountBalance>> {
    return this.hateoasService.getPage<AccountBalance>(AccountBalance, options);
  }

  getAccountsBalanceInCurrency(code: string): Observable<ResourceCollection<AccountBalance>> {
    return this.hateoasService.searchCollection<AccountBalance>(AccountBalance, 'code',
      {
        params: {
          code: code
        }
      })
  }

  getAccountsTotalInCurrency(code: string): Observable<number> {
    return this.http.get<number>(this.getUrl("/accountsTotals/search/balance"), {
      params: {
        code: code
      }
    })
  }

  getBalance(an: number, mois: number, code: string): Observable<number> {

    return this.http.get<number>(this.getUrl('/monthlyDeltas/search/balance'), {
      params: {
        an: an,
        mois: mois,
        code: code
      }
    })

  }
}
