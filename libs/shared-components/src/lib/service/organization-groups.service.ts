import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OrganizationGroup } from '@clematis-shared/model';
import { PagedGetOption } from '@lagoshny/ngx-hateoas-client/lib/model/declarations';
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection,
} from '@lagoshny/ngx-hateoas-client';

import { SearchService } from './search.service';
import { EnvironmentService } from './environment.service';

@Injectable()
export class OrganizationGroupsService extends SearchService<OrganizationGroup> {
  constructor(
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService
  ) {
    super(environmentService);
  }

  searchPage(
    options: PagedGetOption | undefined,
    queryName: string
  ): Observable<PagedResourceCollection<OrganizationGroup>> {
    return this.hateoasService.searchPage<OrganizationGroup>(
      OrganizationGroup,
      queryName,
      options
    );
  }

  getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<OrganizationGroup>> {
    return this.hateoasService.getPage<OrganizationGroup>(
      OrganizationGroup,
      options
    );
  }

  getPathForOrganizationGroup(
    organizationGroupId: string | null
  ): Observable<ResourceCollection<OrganizationGroup>> {
    if (organizationGroupId) {
      return this.hateoasService.searchCollection<OrganizationGroup>(
        OrganizationGroup,
        'pathById',
        {
          params: {
            id: organizationGroupId,
          },
        }
      );
    }
    return of(new ResourceCollection<OrganizationGroup>());
  }
}
