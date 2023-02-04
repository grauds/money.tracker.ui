import { Injectable } from '@angular/core';
import { HateoasService, SearchService } from "@clematis-shared/shared-components";
import { Organization } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { Observable } from "rxjs";
import { PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";

@Injectable()
export class OrganizationsService extends SearchService<Organization> {

  constructor(private hateoasService: HateoasService<Organization>) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string | undefined):
    Observable<PagedResourceCollection<Organization>> {
    return this.hateoasService.searchPage(options, queryName);
  }

}
