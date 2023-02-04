import { Observable } from "rxjs";
import { PagedResourceCollection, Resource } from "@lagoshny/ngx-hateoas-client";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";

export abstract class SearchService<T extends Resource> {

  abstract searchPage(options?: PagedGetOption,
                      queryName?: string | null)
    : Observable<PagedResourceCollection<T>>

}
