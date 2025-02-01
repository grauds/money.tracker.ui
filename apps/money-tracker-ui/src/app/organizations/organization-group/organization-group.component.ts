import { Component, OnInit, ViewChild } from '@angular/core';
import {
  HateoasResourceService,
  RequestParam,
  Sort,
} from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CommodityGroup,
  Entity,
  OrganizationGroup,
} from '@clematis-shared/model';

import {
  EntityComponent,
  EntityListComponent,
  OrganizationGroupsService,
} from '@clematis-shared/shared-components';

import { Title } from '@angular/platform-browser';
import { Utils } from '@clematis-shared/model';

@Component({
  selector: 'app-organization-group',
  templateUrl: './organization-group.component.html',
  styleUrls: ['./organization-group.component.sass'],
  providers: [
    { provide: 'searchService', useClass: OrganizationGroupsService },
  ],
})
export class OrganizationGroupComponent
  extends EntityComponent<OrganizationGroup>
  implements OnInit
{
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<OrganizationGroup>;

  loading = false;

  parent: OrganizationGroup | undefined;

  parentLink: string | undefined;

  children: OrganizationGroup[] = [];

  path: Array<CommodityGroup> = [];

  constructor(
    resourceService: HateoasResourceService,
    private organizationGroupsService: OrganizationGroupsService,
    route: ActivatedRoute,
    router: Router,
    title: Title
  ) {
    super(OrganizationGroup, resourceService, route, router, title);
  }

  ngOnInit(): void {
    this.loading = true;
    this.onInit();
  }

  setLoading($event: boolean) {
    this.loading = $event;
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  setEntities($event: OrganizationGroup[]) {
    this.children = $event;
  }

  override setEntity(entity: OrganizationGroup) {
    super.setEntity(entity);

    this.entityList?.refreshData({
      queryArguments: this.getQueryArguments(),
      queryName: 'recursiveByParentId',
    });

    this.entity?.getRelation<OrganizationGroup>('parent').subscribe({
      next: (parent: OrganizationGroup) => {
        this.parent = parent;
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent);
      },
      error: () => {
        this.parent = undefined;
        this.parentLink = undefined;
      },
      complete: () => {
        this.parent = undefined;
        this.parentLink = undefined;
      },
    });

    if (this.entity) {
      this.organizationGroupsService
        .getPathForOrganizationGroup(Utils.getIdFromSelfUrl(this.entity))
        .subscribe((response) => {
          this.path = response.resources;
        });
    }
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
