import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Commodity, MoneyType, CommodityGroup, MoneyTypes, ExpenseItem, Entity } from '@clematis-shared/model';
import { EntityComponent } from '@clematis-shared/shared-components';
import { Utils } from '@clematis-shared/model';
import { MoneyTrackerService } from '@clematis-shared/money-tracker-service';
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.sass']
})
export class CommodityComponent extends EntityComponent<Commodity> implements OnInit {

  defaultUnit: string | undefined;

  defaultMoneyType: MoneyType | undefined;

  parent: CommodityGroup | undefined;

  parentLink: string | undefined;

  path: Array<CommodityGroup> = [];

  totalSum: number = 0;

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

  averagePrice: number | undefined;

  totalQty: number | undefined;

  constructor(resourceService: HateoasResourceService,
              private moneyTrackerService: MoneyTrackerService,
              route: ActivatedRoute,
              router: Router,
              title: Title) {
    super(Commodity, resourceService, route, router, title)
  }

  ngOnInit(): void {
    this.onInit()
  }

  override setEntity(entity: Commodity) {
    super.setEntity(entity)

    this.defaultUnit = this.entity?.unittype?.shortName

    this.entity?.getRelation<MoneyType>('defaultMoneyType').subscribe((defaultMoneyType: MoneyType) => {
        this.defaultMoneyType = defaultMoneyType
      })

    this.entity?.getRelation<CommodityGroup>('parent').subscribe((parent: CommodityGroup) => {
        this.parent = parent
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent)
      this.moneyTrackerService.getPathForCommodityGroup(Utils.getIdFromSelfUrl(this.parent)).subscribe((response) => {
          this.path = response.resources.reverse()
          if (this.parent) {
            this.path.push(this.parent)
          }
        })
      })

    this.moneyTrackerService.getTotalsForCommodity(this.id, MoneyTypes.RUB).subscribe((response) => {
      this.totalSum = response

      this.moneyTrackerService.getTotalQtyForCommodity(this.id).subscribe((response) => {
        this.totalQty = response
        this.averagePrice = this.totalSum / this.totalQty
      })
    })

    this.moneyTrackerService.getCommodityExpences(this.id).subscribe((response) => {
      this.expenses = response.resources

      this.expenses.forEach(expense => {
        this.graph.data[0].x.push(expense.transferDate)
        this.graph.data[0].y.push(expense.total)

        this.graph.data[1].x.push(expense.transferDate)
        this.graph.data[1].y.push(expense.price)
      })

    })
  }
}
