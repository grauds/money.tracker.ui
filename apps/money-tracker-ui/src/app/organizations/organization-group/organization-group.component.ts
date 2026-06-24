import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
  Sort,
} from '@lagoshny/ngx-hateoas-client';
import {
  Entity,
  OrganizationGroup
} from '@clematis-shared/model';
import {
  EntityComponent,
  EntityListComponent,
  EntityService,
  OrganizationGroupsService,
  RESOURCE_TYPE,
  PARENT_RESOURCE_TYPE, MoneyTypeService
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-organization-group',
  templateUrl: './organization-group.component.html',
  styleUrls: ['./organization-group.component.sass'],
  providers: [
    { provide: 'searchService', useClass: OrganizationGroupsService },
    EntityService,
    { provide: RESOURCE_TYPE, useValue: OrganizationGroup },
    { provide: PARENT_RESOURCE_TYPE, useValue: OrganizationGroup },
  ],
  standalone: false,
})
export class OrganizationGroupComponent extends EntityComponent<
  OrganizationGroup,
  OrganizationGroup
> {
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<OrganizationGroup>;

  children: Entity[] = [];

  constructor(
    resourceService: HateoasResourceService,
    entityService: EntityService<OrganizationGroup, OrganizationGroup>,
    protected override readonly moneyTypeService: MoneyTypeService,
    route: ActivatedRoute,
    router: Router,
    title: Title,
  ) {
    super(
      OrganizationGroup,
      resourceService,
      moneyTypeService,
      route,
      router,
      title,
      entityService,
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
    });
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
