import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Commodity, MoneyType, CommodityGroup, MoneyTypes, ExpenseItem, Entity } from '@clematis-shared/model';
import { EntityComponent } from '@clematis-shared/shared-components';
import { Utils } from '@clematis-shared/shared-components';
import { MoneyTrackerService } from '@clematis-shared/money-tracker-service';

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
    }],
    layout: {autosize: true, title: 'Money Spent'},
  };

  graphQty: any = {
    data: [{
      x: [],
      y: [],
      name: 'Quantity',
      type: 'scatter'
    }],
    layout: {autosize: true, title: 'Quantity Bought'},
  };

  averagePrice: number | undefined;

  path: Array<CommodityGroup> = [];

  constructor(resourceService: HateoasResourceService,
              private moneyTrackerService: MoneyTrackerService,
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
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent)
        this.moneyTrackerService.getPathForCommodity(Utils.getIdFromSelfUrl(this.parent), (response) => {
          this.path = response.resources
        }, (error) => {
          // todo error handling
        })
      })

    this.moneyTrackerService.getTotalsForCommodity(this.id, MoneyTypes.RUB, (response) => {
      this.totalSum = response

      this.moneyTrackerService.getTotalQtyForCommodity(this.id, (response) => {
        this.totalQty = response
        this.averagePrice = this.totalSum / this.totalQty
      }, (error) => {
        // todo error handling
      })

    }, (error) => {
      // todo error handling
    })

    this.moneyTrackerService.getCommodityExpences(this.id, (response) => {
      this.expenses = response.resources

      this.expenses.forEach(expense => {
        this.graph.data[0].x.push(expense.transferDate)
        this.graph.data[0].y.push(expense.total)

        this.graph.data[1].x.push(expense.transferDate)
        this.graph.data[1].y.push(expense.price)

        this.graphQty.data[0].x.push(expense.transferDate)
        this.graphQty.data[0].y.push(expense.qty)
      })

    }, (error) => {
      // todo error handling
    })

  };
}
