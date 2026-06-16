import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
} from '@lagoshny/ngx-hateoas-client';
import {
  Commodity,
  MoneyType,
  CommodityGroup,
  MoneyTypes,
  Entity,
  IncomeItem,
  ExpenseItem,
  Utils,
} from "@clematis-shared/model";
import {
  CommoditiesService,
  CommodityGroupService,
  EntityComponent,
  IncomeItemsService,
  ExpenseItemsService,
  StorageService,
  PhotoUploaderComponent
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { catchError, EMPTY, forkJoin } from "rxjs";

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.sass'],
  providers: [],
  standalone: false,
})
export class CommodityComponent extends EntityComponent<Commodity>
  implements OnInit {

  displayedColumns: string[] = [
    'transferdate',
    'price',
    'qty',
    'organizationname',
  ];

  defaultUnit: string | undefined;

  defaultMoneyType: MoneyType | undefined;

  parent: CommodityGroup | undefined;

  image: PhotoUploaderComponent | undefined;

  parentLink: string | undefined;


  income: IncomeItem[] = [];

  totalIncomeSum = 0;

  averageIncomePrice: number | undefined;

  totalIncomeQty: number | undefined;


  expenses: ExpenseItem[] = [];

  totalSum = 0;

  averagePrice: number | undefined;

  totalQty: number | undefined;


  loading = false;

  option: any = {};

  path: Array<CommodityGroup> = [];

  constructor(
    resourceService: HateoasResourceService,
    public readonly expenseService: ExpenseItemsService,
    public readonly incomeService: IncomeItemsService,
    private readonly commodityService: CommoditiesService,
    private readonly commodityGroupService: CommodityGroupService,
    private readonly uploadService: StorageService,
    route: ActivatedRoute,
    router: Router,
    title: Title
  ) {
    super(Commodity, resourceService, route, router, title);

    this.image = new PhotoUploaderComponent(this.uploadService);
  }

  ngOnInit(): void {
    this.loading = true;
    this.onInit();
  }

  override setEntity(entity: Commodity) {
    super.setEntity(entity);

    this.clearPreviousData();

    if (!this.entity) {
      return;
    }

    this.defaultUnit = this.entity?.unittype?.shortName;

    const income$ = this.commodityService
      .getTotalIncomeForCommodity(this.id, MoneyTypes.RUB)
      .pipe(
        catchError((err) => {
          console.log(err)
          return EMPTY;
        })
      );

    const outcome$ = this.commodityService
      .getTotalExpenseForCommodity(this.id, MoneyTypes.RUB)
      .pipe(
        catchError((err) => {
          console.log(err)
          return EMPTY;
        })
      );

    const moneyType$ = this.entity?.getRelation<MoneyType>('defaultMoneyType')
      .pipe(
        catchError((err) => {
          console.log(err)
          return EMPTY;
        })
      );

    const parent$ = this.entity?.getRelation<CommodityGroup>('parent')
      .pipe(
        catchError((err) => {
          console.log(err)
          this.parent = undefined;
          this.parentLink = undefined;
          return EMPTY;
        })
      );

    const totals$ = this.commodityService
      .getTotalQtyForCommodity(this.id)
      .pipe(
        catchError((err) => {
          console.log(err)
          return EMPTY;
        })
      );

    forkJoin({
      moneyType: moneyType$,
      parent: parent$,
      totals: totals$,
      outcome: outcome$,
    }).subscribe({
      next: (result) => {

        if (result.moneyType) {
          this.defaultMoneyType = result.moneyType;
        }

        if (result.parent) {
          this.parent = result.parent;
          this.parentLink = Entity.getRelativeSelfLinkHref(result.parent);
          this.commodityGroupService
            .getPathForCommodityGroup(Utils.getIdFromSelfUrl(result.parent))
            .subscribe((response) => {
              this.path = response.resources.reverse();
              if (result.parent) {
                this.path.push(result.parent);
              }
            });
        }

        if (result.totals) {
          this.totalQty = result.totals;
        }

        if (result.outcome) {
          this.totalSum = result.outcome;
          if (this.totalQty) {
            this.averagePrice = this.totalSum / this.totalQty;
          }
        }
      },
      error: (err) => console.error('An error occurred loading commodity data', err)
    });
  }

  private clearPreviousData() {
    this.defaultUnit = undefined;
    this.defaultMoneyType = undefined;
    this.parent = undefined;
    this.parentLink = undefined;
    this.path = [];
    this.totalQty = undefined;
    this.totalSum = 0;
    this.averagePrice = undefined;
  }

  setLoading($event: boolean) {
    setTimeout(() => {
      this.loading = $event;
    });
  }

  getQueryArguments(): RequestParam {
    return {
      commodityId: this.id ? this.id : '',
    };
  }

  setEntities($event: ExpenseItem[]) {
    setTimeout(() => {
      this.expenses = $event;
      this.option = this.getData();
    })
  }

  setIncomeEntities($event: IncomeItem[]) {
    setTimeout(() => {
      this.income = $event;
      this.option = this.getData();
    })
  }

  getData() {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: any) {
          if (params) {
            return params
              .map((param: any) => {
                return (
                  param.seriesName + ' : ' + Math.round(param.value * 100) / 100
                );
              })
              .join('<br/>');
          }
          return 'No params';
        },
      },
      legend: {
        data: ['Total', 'Price'],
        bottom: 0
      },
      xAxis: {
        type: 'category',
        data: this.expenses.map((expense) => {
          return formatDate(
            expense.transferDate,
            'shortDate',
            navigator.language
          );
        }),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Total',
          data: this.expenses.map((expense) => {
            return expense.qty * expense.price;
          }),
          type: 'line',
        },
        {
          name: 'Price',
          data: this.expenses.map((expense) => {
            return expense.price;
          }),
          type: 'line',
        },
      ],
    };
  }
}
