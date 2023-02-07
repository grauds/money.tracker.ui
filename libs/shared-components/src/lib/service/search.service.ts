import { BehaviorSubject, Observable } from "rxjs";
import { PagedResourceCollection, Resource } from "@lagoshny/ngx-hateoas-client";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";

import { environment } from "../../../../../apps/money-tracker-ui/src/environments/environment";

export abstract class SearchService<T extends Resource> {

  private statusDescription$ = new BehaviorSubject<string>("search")

  abstract searchPage(options?: PagedGetOption, queryName?: string | null)
                                            : Observable<PagedResourceCollection<T>>

  abstract getPage(options?: PagedGetOption): Observable<PagedResourceCollection<T>>

  setProcessingStatusDescription(message: string): void {
    this.statusDescription$.next(message)
  }

  getStatusDescription() {
    return this.statusDescription$
  }

  getUrl(url: string) :string {
    return environment.apiUrl + url
  }
}
