import { Observable } from "rxjs";
import { PagedResourceCollection, Resource } from "@lagoshny/ngx-hateoas-client";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { environment } from "../../../../../apps/money-tracker-ui/src/environments/environment";

export abstract class SearchService<T extends Resource> {

  abstract searchPage(options?: PagedGetOption, queryName?: string | null)
                                            : Observable<PagedResourceCollection<T>>

  abstract getPage(options?: PagedGetOption): Observable<PagedResourceCollection<T>>

  getUrl(url: string) :string {
    return environment.apiUrl + url
  }
}
