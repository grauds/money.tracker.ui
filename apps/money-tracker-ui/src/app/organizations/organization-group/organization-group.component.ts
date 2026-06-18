import { Component, OnInit, ViewChild } from '@angular/core';
import {
  HateoasResourceService,
  RequestParam,
  Sort,
} from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';

import {
  OrganizationGroup,
} from '@clematis-shared/model';

import {
  EntityComponent,
  EntityListComponent,
  EntityService,
  OrganizationGroupsService,
  RESOURCE_TYPE,
  PARENT_RESOURCE_TYPE
} from "@clematis-shared/shared-components";

import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-organization-group',
  templateUrl: './organization-group.component.html',
  styleUrls: ['./organization-group.component.sass'],
  providers: [
    { provide: 'searchService', useClass: OrganizationGroupsService },
    EntityService,
    { provide: RESOURCE_TYPE, useValue: OrganizationGroup },
    { provide: PARENT_RESOURCE_TYPE, useValue: OrganizationGroup }
  ],
  standalone: false,
})
export class OrganizationGroupComponent
  extends EntityComponent<OrganizationGroup, OrganizationGroup>
  implements OnInit
{
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<OrganizationGroup>;

  children: OrganizationGroup[] = [];

  constructor(
    resourceService: HateoasResourceService,
    private readonly organizationGroupsService: OrganizationGroupsService,
    entityService: EntityService<OrganizationGroup, OrganizationGroup>,
    route: ActivatedRoute,
    router: Router,
    title: Title
  ) {
    super(
      OrganizationGroup, resourceService, route, router, title, entityService
    );
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  setEntities($event: OrganizationGroup[]) {
    setTimeout(() => {
      this.children = $event;
    })
  }

  override onEntityLoaded(entity: OrganizationGroup) {
    if (!entity) {
      return;
    }

    this.entityList?.refreshData({
      queryArguments: this.getQueryArguments(),
      queryName: 'recursiveByParentId',
    });
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
