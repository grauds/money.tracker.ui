import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
  Sort,
} from '@lagoshny/ngx-hateoas-client';
import {
  Entity,
  CommodityGroup,
} from '@clematis-shared/model';
import {
  EntityComponent,
  EntityListComponent,
  EntityService,
  CommodityGroupService,
  RESOURCE_TYPE,
  PARENT_RESOURCE_TYPE
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-commodity-group',
  templateUrl: './commodity-group.component.html',
  styleUrls: ['./commodity-group.component.sass'],
  providers: [
    { provide: 'searchService', useClass: CommodityGroupService },
    EntityService,
    { provide: RESOURCE_TYPE, useValue: CommodityGroup },
    { provide: PARENT_RESOURCE_TYPE, useValue: CommodityGroup },
  ],
  standalone: false,
})
export class CommodityGroupComponent extends EntityComponent<
  CommodityGroup,
  CommodityGroup
> {
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<CommodityGroup>;

  children: Entity[] = [];

  constructor(
    resourceService: HateoasResourceService,
    entityService: EntityService<CommodityGroup, CommodityGroup>,
    route: ActivatedRoute,
    router: Router,
    title: Title,
  ) {
    super(
      CommodityGroup,
      resourceService,
      route,
      router,
      title,
      entityService
    );
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  setEntities($event: CommodityGroup[]) {
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
