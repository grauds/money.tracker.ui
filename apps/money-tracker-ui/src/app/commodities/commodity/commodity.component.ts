import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {HateoasResourceService, RequestParam} from '@lagoshny/ngx-hateoas-client';
import {
  Commodity,
  MoneyType,
  CommodityGroup,
  MoneyTypes,
  ExpenseItem,
  Entity
} from '@clematis-shared/model';
import {
  CommoditiesService,
  CommodityGroupsService,
  EntityComponent,
  ExpenseItemsService
} from '@clematis-shared/shared-components';
import { Utils } from '@clematis-shared/model';
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.sass'],
  providers: [
    { provide: 'searchService', useClass: ExpenseItemsService }
  ]
})
export class CommodityComponent extends EntityComponent<Commodity> implements OnInit {

  displayedColumns: string[] = ['transferdate', 'price', 'qty', 'organizationname'];

  defaultUnit: string | undefined;

  defaultMoneyType: MoneyType | undefined;

  parent: CommodityGroup | undefined;

  parentLink: string | undefined;

  path: Array<CommodityGroup> = [];

  totalSum: number = 0;

  expenses: ExpenseItem[] = [];

  loading: boolean = false;

  pageLoading: boolean = false;

  graph: any = {
    data: [{
      x: [],
      y: [],
      name: 'Total Sum',
      type: 'bar'
    }, {
      x: [],
      y: [],
      name: 'Price',
      type: 'line'
    }],
    layout: {autosize: true, title: 'Money Spent'},
  };

  averagePrice: number | undefined;

  totalQty: number | undefined;

  constructor(resourceService: HateoasResourceService,
              private commodityService: CommoditiesService,
              private commodityGroupService: CommodityGroupsService,
              private expenseItemsService: ExpenseItemsService,
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
      this.commodityGroupService.getPathForCommodityGroup(Utils.getIdFromSelfUrl(this.parent)).subscribe((response) => {
          this.path = response.resources.reverse()
          if (this.parent) {
            this.path.push(this.parent)
          }
        })
      })

    this.commodityService.getTotalQtyForCommodity(this.id).subscribe((response) => {
      this.totalQty = response

      this.commodityService.getTotalsForCommodity(this.id, MoneyTypes.RUB).subscribe((response) => {
        this.totalSum = response

        if (this.totalQty) {
          this.averagePrice = this.totalSum / this.totalQty
        }
      })
    })
  }

  setPageLoading($event: boolean) {
    this.pageLoading = $event
  }

  setLoading($event: boolean) {
    this.loading = $event
  }

  getQueryArguments(): RequestParam {
    return {
        commodityId: this.id ? this.id : ''
      }
  }

  setEntities($event: ExpenseItem[]) {
    this.expenses = $event

    this.graph.data[0].x = []
    this.graph.data[0].y = []

    this.graph.data[1].x = []
    this.graph.data[1].y = []

    this.expenses.forEach(expense => {
      this.graph.data[0].x.push(expense.transferDate)
      this.graph.data[0].y.push(expense.total)

      this.graph.data[1].x.push(expense.transferDate)
      this.graph.data[1].y.push(expense.price)
    })
  }
}
