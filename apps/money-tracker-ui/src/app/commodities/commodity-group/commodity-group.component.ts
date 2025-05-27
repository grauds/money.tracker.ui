import { Component, OnInit, ViewChild } from '@angular/core';
import {
  HateoasResourceService,
  RequestParam,
  Sort,
} from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CommodityGroup,
  MoneyTypes,
  Entity,
  ExpenseItem,
} from '@clematis-shared/model';
import {
  CommodityGroupService,
  EntityComponent,
  EntityListComponent,
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';
import { Utils } from '@clematis-shared/model';

@Component({
  selector: 'app-commodity-group',
  templateUrl: './commodity-group.component.html',
  styleUrls: ['./commodity-group.component.sass'],
  providers: [{ provide: 'searchService', useClass: CommodityGroupService }],
  standalone: false,
})
export class CommodityGroupComponent
  extends EntityComponent<CommodityGroup>
  implements OnInit
{
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<CommodityGroup>;

  loading = false;

  parent: CommodityGroup | undefined;

  parentLink: string | undefined;

  children: Entity[] = [];

  totalSum: number | undefined;

  path: Array<CommodityGroup> = [];

  constructor(
    resourceService: HateoasResourceService,
    private commodityGroupService: CommodityGroupService,
    route: ActivatedRoute,
    router: Router,
    title: Title
  ) {
    super(CommodityGroup, resourceService, route, router, title);
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

  setEntities($event: ExpenseItem[]) {
    this.children = $event;
  }

  override setEntity(entity: CommodityGroup) {
    super.setEntity(entity);

    this.entityList?.refreshData({
      queryArguments: this.getQueryArguments(),
      queryName: 'recursiveByParentId',
    });

    this.entity
      ?.getRelation<CommodityGroup>('parent')
      .subscribe((parent: CommodityGroup) => {
        this.parent = parent;
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent);
      });

    if (this.entity) {
      this.commodityGroupService
        .getPathForCommodityGroup(Utils.getIdFromSelfUrl(this.entity))
        .subscribe((response) => {
          this.path = response.resources.reverse();
        });
    }

    this.commodityGroupService
      .getTotalsForCommodityGroup(this.id, MoneyTypes.RUB)
      .subscribe((response) => {
        this.totalSum = response;
        this.loading = false;
      });
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
