import { Component, OnInit } from '@angular/core';
import { HateoasResourceService, ResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute } from '@angular/router';

import { CommodityGroup, Commodity, MoneyTypes, Entity } from '@clematis-shared/model';
import { MoneyTrackerService } from '@clematis-shared/money-tracker-service';
import { EntityComponent, Utils } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-commodity-group',
  templateUrl: './commodity-group.component.html',
  styleUrls: ['./commodity-group.component.css']
})
export class CommodityGroupComponent extends EntityComponent<CommodityGroup> implements OnInit {

  currentRate: number = 2;

  loading: boolean = true;

  parent: CommodityGroup | undefined;

  parentLink: string | undefined;

  childGroups: CommodityGroup[] = []

  childCommodities: Commodity[] = []

  totalSum: number | undefined;

  path: Array<CommodityGroup> = [];

  constructor(resourceService: HateoasResourceService,
              private moneyTrackerService: MoneyTrackerService,
              route: ActivatedRoute) {
    super(CommodityGroup, resourceService, route);
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
      this.moneyTrackerService.getPathForCommodityGroup(Utils.getIdFromSelfUrl(this.entity), (response) => {
        this.path = response.resources.reverse()
        if (this.parent) {
          this.path.push(this.parent)
        }
      }, (error) => {
        // todo error handling
      })
    }

    this.moneyTrackerService.getTotalsForCommodityGroup(this.id, MoneyTypes.RUB, (response) => {
      this.totalSum = response
      this.loading = false
    }, (error) => {
      this.loading = false
    })
  };


}
