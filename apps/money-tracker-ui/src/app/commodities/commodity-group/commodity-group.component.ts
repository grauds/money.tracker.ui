import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
  Sort,
} from '@lagoshny/ngx-hateoas-client';
import {
  CommodityGroup,
  Entity,
  ExpenseItem,
} from '@clematis-shared/model';
import {
  CommodityGroupService,
  EntityComponent,
  EntityListComponent, EntityService,
  RESOURCE_TYPE,
  PARENT_RESOURCE_TYPE
} from "@clematis-shared/shared-components";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-commodity-group',
  templateUrl: './commodity-group.component.html',
  styleUrls: ['./commodity-group.component.sass'],
  providers: [
    { provide: 'searchService', useClass: CommodityGroupService },
    EntityService,
    { provide: RESOURCE_TYPE, useValue: CommodityGroup },
    { provide: PARENT_RESOURCE_TYPE, useValue: CommodityGroup }
  ],
  standalone: false,
})
export class CommodityGroupComponent
  extends EntityComponent<CommodityGroup, CommodityGroup>
  implements OnInit
{
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<CommodityGroup>;

  children: Entity[] = [];

  constructor(
    resourceService: HateoasResourceService,
    private readonly commodityGroupService: CommodityGroupService,
    entityService: EntityService<CommodityGroup, CommodityGroup>,
    route: ActivatedRoute,
    router: Router,
    title: Title
  ) {
    super(CommodityGroup, resourceService, route, router, title, entityService);
  }

  override onEntityLoaded(entity: CommodityGroup) {
    if (!entity) {
      return;
    }

    this.entityList?.refreshData({
      queryArguments: this.getQueryArguments(),
      queryName: 'recursiveByParentId',
    });
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  setEntities($event: ExpenseItem[]) {
    setTimeout(() => {
      this.children = $event;
    })
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
