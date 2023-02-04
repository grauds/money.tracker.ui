import { Injectable } from '@angular/core';
import { HateoasService, SearchService } from "@clematis-shared/shared-components";
import { CommodityGroup } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { Observable } from "rxjs";
import { PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";

@Injectable()
export class CommodityGroupsService extends SearchService<CommodityGroup> {

  constructor(private hateoasService: HateoasService<CommodityGroup>) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string | undefined):
    Observable<PagedResourceCollection<CommodityGroup>> {
    return this.hateoasService.searchPage(options, queryName);
  }

}
