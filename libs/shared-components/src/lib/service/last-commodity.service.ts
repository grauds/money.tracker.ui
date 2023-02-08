import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from "rxjs";
import { Entity, LastCommodity } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { HateoasResourceService, PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";
import { SearchService } from './search.service';

@Injectable()
export class LastCommodityService extends SearchService<LastCommodity> {

  constructor(private hateoasService: HateoasResourceService) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<LastCommodity>> {
    return this.hateoasService.searchPage<LastCommodity>(LastCommodity, queryName, options).pipe(
      this.postprocess()
    )
  }

  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<LastCommodity>> {
    return this.hateoasService.getPage<LastCommodity>(LastCommodity, options).pipe(
      this.postprocess()
    )
  }

  postprocess() {
    return switchMap((arr: PagedResourceCollection<LastCommodity>) => {
      arr.resources = arr.resources.map((lastCommodity: LastCommodity) => {
        lastCommodity.commodityLink = Entity.getRelativeSelfLinkHref(lastCommodity.commodity)
        lastCommodity.organizationLink = Entity.getRelativeSelfLinkHref(lastCommodity.organization)
        return lastCommodity
      })
      return of(arr)
    });
  }

}
