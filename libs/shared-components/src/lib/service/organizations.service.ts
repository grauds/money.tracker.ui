import { Injectable } from '@angular/core';
import { Organization } from '@clematis-shared/model';
import { Observable } from 'rxjs';
import {
  HateoasResourceService,
  PagedResourceCollection,
  PagedGetOption
} from '@lagoshny/ngx-hateoas-client';

import { SearchService } from './search.service';
import { EnvironmentService } from './environment.service';

@Injectable()
export class OrganizationsService extends SearchService<Organization> {
  constructor(
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService
  ) {
    super(environmentService);
  }

  searchPage(
    options: PagedGetOption | undefined,
    queryName: string
  ): Observable<PagedResourceCollection<Organization>> {
    return this.hateoasService.searchPage<Organization>(
      Organization,
      queryName,
      options
    );
  }

  getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<Organization>> {
    return this.hateoasService.getPage<Organization>(Organization, options);
  }
}
