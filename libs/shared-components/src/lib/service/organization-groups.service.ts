import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HateoasService, SearchService } from "@clematis-shared/shared-components";
import { OrganizationGroup } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";

@Injectable()
export class OrganizationGroupsService extends SearchService<OrganizationGroup> {

  constructor(private hateoasService: HateoasService<OrganizationGroup>) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string | undefined):
    Observable<PagedResourceCollection<OrganizationGroup>> {
    return this.hateoasService.searchPage(options, queryName);
  }

}
