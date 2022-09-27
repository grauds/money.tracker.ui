import { Component, OnInit } from '@angular/core';
import { HateoasResourceService, ResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute } from '@angular/router';
import { EntityComponent } from '../../common/widgets/entity/entity.component';
import { CommodityGroup } from '../../common/model/commodity-group';
import { Utils } from '../../common/utils/utils';
import { Commodity } from '../../common/model/commodity';
import { MoneyTypes } from '../../common/model/money-types';
import { TotalsStatisticsService } from '../../common/services/totals-statistics.service';

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

  constructor(resourceService: HateoasResourceService,
              private totalsStats: TotalsStatisticsService,
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
        this.parentLink = Utils.parseResourceUrlToAppUrl(this.parent.getSelfLinkHref())
      })

    this.resourceService.searchCollection(CommodityGroup, 'recursiveByParentId', {
      params: {
        id: this.id ? this.id : '1'
      }
    })
      .subscribe((collection: ResourceCollection<CommodityGroup>) => {
        this.childGroups = collection.resources;
      });

    this.resourceService.searchCollection(Commodity, 'recursiveByParentId', {
      params: {
        id: this.id ? this.id : '1'
      }
    })
      .subscribe((collection: ResourceCollection<Commodity>) => {
        this.childCommodities = collection.resources;
      });

    this.totalsStats.getTotalsForCommodityGroup(this.id, MoneyTypes.RUB, (response) => {
      this.totalSum = response
    }, (error) => {
      // todo error handling
    })
  };


}
