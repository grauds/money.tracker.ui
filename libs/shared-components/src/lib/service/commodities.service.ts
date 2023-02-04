import { Injectable } from '@angular/core';
import { HateoasService, SearchService } from "@clematis-shared/shared-components";
import { Commodity } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { Observable } from "rxjs";
import { PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";

@Injectable()
export class CommoditiesService extends SearchService<Commodity> {

  constructor(private hateoasService: HateoasService<Commodity>) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string | undefined):
    Observable<PagedResourceCollection<Commodity>> {
    return this.hateoasService.searchPage(options, queryName);
  }
}
