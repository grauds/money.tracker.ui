import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { EntityComponent } from '../../common/widgets/entity/entity.component';
import { Commodity } from '../../common/model/commodity';
import { MoneyType } from '../../common/model/money-type';
import { Utils } from '../../common/utils/utils';
import { CommodityGroup } from '../../common/model/commodity-group';
import { TotalsStatisticsService } from '../../common/services/totals-statistics.service';
import { MoneyTypes } from '../../common/model/money-types';
import { ExpenseItem } from '../../common/model/expense-item';
import Plotly from 'plotly.js';

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.css']
})
export class CommodityComponent extends EntityComponent<Commodity> implements OnInit {

  images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);

  currentRate: number = 2;

  defaultPrice: number | undefined = 0;

  defaultUnit: string | undefined;

  defaultMoneyType: MoneyType | undefined;

  parent: CommodityGroup | undefined;

  parentLink: string | undefined;

  totalSum: number | undefined;

  totalQty: number | undefined;

  expenses: ExpenseItem[] = [];

  graph: any = {
    data: [{
      x: [],
      y: [],
      type: 'scatter'
    }],
    layout: {autosize: true, title: 'Transactions History'},
  };

  constructor(resourceService: HateoasResourceService,
              private totalsStats: TotalsStatisticsService,
              route: ActivatedRoute) {
    super(Commodity, resourceService, route);
  }

  ngOnInit(): void {
    this.onInit()
  }


  override setEntity(entity: Commodity) {
    super.setEntity(entity)

    this.defaultPrice = this.entity?.defaultPrice
    this.defaultUnit = this.entity?.unittype?.shortName

    this.entity?.getRelation<MoneyType>('defaultMoneyType')
      .subscribe((defaultMoneyType: MoneyType) => {
        this.defaultMoneyType = defaultMoneyType
      })

    this.entity?.getRelation<CommodityGroup>('parent')
      .subscribe((parent: CommodityGroup) => {
        this.parent = parent
        this.parentLink = Utils.parseResourceUrlToAppUrl(this.parent.getSelfLinkHref())
      })

    this.totalsStats.getTotalsForCommodity(this.id, MoneyTypes.RUB, (response) => {
      this.totalSum = response
    }, (error) => {
      // todo error handling
    })

    this.totalsStats.getTotalQtyForCommodity(this.id, (response) => {
      this.totalQty = response
    }, (error) => {
      // todo error handling
    })

    this.totalsStats.getCommodityExpences(this.id, (response) => {
      this.expenses = response.resources

      this.expenses.forEach(expense => {
        this.graph.data[0].x.push(expense.transferDate)
        this.graph.data[0].y.push(expense.total)
      })

    }, (error) => {
      // todo error handling
    })

  };
}
