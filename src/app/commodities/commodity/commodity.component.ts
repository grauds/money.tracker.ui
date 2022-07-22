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

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.css']
})
export class CommodityComponent extends EntityComponent<Commodity> implements OnInit {

  currentRate: number = 2;

  defaultPrice: number | undefined = 0;

  defaultUnit: string | undefined;

  defaultMoneyType: MoneyType | undefined;

  parent: CommodityGroup | undefined;

  parentLink: string | undefined;

  totalSum: number = 0;

  totalQty: number | undefined;

  expenses: ExpenseItem[] = [];

  graph: any = {
    data: [{
      x: [],
      y: [],
      name: 'Total Sum',
      type: 'scatter'
    }, {
      x: [],
      y: [],
      name: 'Price',
      type: 'scatter'
    }, {
      x: [],
      y: [],
      name: 'Quantity',
      type: 'scatter'
    }],
    layout: {autosize: true, title: 'Transactions History'},
  };

  averagePrice: number | undefined;

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

      this.totalsStats.getTotalQtyForCommodity(this.id, (response) => {
        this.totalQty = response
        this.averagePrice = this.totalSum / this.totalQty
      }, (error) => {
        // todo error handling
      })

    }, (error) => {
      // todo error handling
    })

    this.totalsStats.getCommodityExpences(this.id, (response) => {
      this.expenses = response.resources

      this.expenses.forEach(expense => {
        this.graph.data[0].x.push(expense.transferDate)
        this.graph.data[0].y.push(expense.total)

        this.graph.data[1].x.push(expense.transferDate)
        this.graph.data[1].y.push(expense.price)

        this.graph.data[2].x.push(expense.transferDate)
        this.graph.data[2].y.push(expense.qty)
      })

    }, (error) => {
      // todo error handling
    })

  };
}
