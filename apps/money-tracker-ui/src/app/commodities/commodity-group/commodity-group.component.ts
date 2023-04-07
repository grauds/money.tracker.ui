import { Component, OnInit } from '@angular/core';
import { HateoasResourceService, ResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { CommodityGroup, Commodity, MoneyTypes, Entity } from '@clematis-shared/model';
import { CommodityGroupsService, EntityComponent } from '@clematis-shared/shared-components';
import { Title } from "@angular/platform-browser";
import { Utils } from '@clematis-shared/model';

@Component({
  selector: 'app-commodity-group',
  templateUrl: './commodity-group.component.html',
  styleUrls: ['./commodity-group.component.sass']
})
export class CommodityGroupComponent extends EntityComponent<CommodityGroup> implements OnInit {

  loading: boolean = true;

  parent: CommodityGroup | undefined;

  parentLink: string | undefined;

  childGroups: CommodityGroup[] = []

  childCommodities: Commodity[] = []

  totalSum: number | undefined;

  path: Array<CommodityGroup> = [];

  constructor(resourceService: HateoasResourceService,
              private commodityGroupService:CommodityGroupsService,
              route: ActivatedRoute,
              router: Router,
              title: Title) {
    super(CommodityGroup, resourceService, route, router, title);
  }

  ngOnInit(): void {
    this.onInit()
  }

  override setEntity(entity: CommodityGroup) {
    super.setEntity(entity)

    this.entity?.getRelation<CommodityGroup>('parent')
      .subscribe((parent: CommodityGroup) => {
        this.parent = parent
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent)
      })

    this.resourceService.searchCollection(CommodityGroup, 'recursiveByParentId', {
      params: {
        id: this.id ? this.id : '1'
      }
    })
      .subscribe((collection: ResourceCollection<CommodityGroup>) => {
        this.childGroups = collection.resources;
      });

    this.resourceService.searchCollection(Commodity, 'recursiveByParentGroupId', {
      params: {
        id: this.id ? this.id : '1'
      }
    })
      .subscribe((collection: ResourceCollection<Commodity>) => {
        this.childCommodities = collection.resources;
      });

    if (this.entity) {
      this.commodityGroupService.getPathForCommodityGroup(Utils.getIdFromSelfUrl(this.entity)).subscribe((response) => {
        this.path = response.resources.reverse()
      })
    }

    this.commodityGroupService.getTotalsForCommodityGroup(this.id, MoneyTypes.RUB).subscribe((response) => {
      this.totalSum = response
      this.loading = false
    })
  };


}
