import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HateoasService, SearchService } from "@clematis-shared/shared-components";
import { LastCommodity } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";

@Injectable()
export class LastCommodityService extends SearchService<LastCommodity> {

  constructor(private hateoasService: HateoasService<LastCommodity>) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string | undefined):
    Observable<PagedResourceCollection<LastCommodity>> {
    return this.hateoasService.searchPage(options, queryName);
  }

}
