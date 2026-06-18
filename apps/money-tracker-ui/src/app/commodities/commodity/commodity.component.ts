import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
} from '@lagoshny/ngx-hateoas-client';
import {
  Commodity,
  MoneyType,
  CommodityGroup,
  ExpenseItem,
} from "@clematis-shared/model";
import {
  CommoditiesService,
  EntityComponent,
  ExpenseItemsService,
  StorageService,
  PhotoUploaderComponent,
  RESOURCE_TYPE,
  PARENT_RESOURCE_TYPE,
  EntityService
} from "@clematis-shared/shared-components";
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import {
  takeUntil,
  catchError,
  EMPTY,
  forkJoin
} from "rxjs";

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.sass'],
  providers: [
    EntityService,
    { provide: RESOURCE_TYPE, useValue: Commodity },
    { provide: PARENT_RESOURCE_TYPE, useValue: CommodityGroup }
  ],
  standalone: false,
})
export class CommodityComponent
  extends EntityComponent<Commodity, CommodityGroup>
  implements OnDestroy {

  displayedColumns: string[] = [
    'transferdate',
    'price',
    'qty',
    'organizationname',
  ];

  defaultUnit: string | undefined;

  defaultMoneyType: MoneyType | undefined;

  image: PhotoUploaderComponent | undefined;

  expenses: ExpenseItem[] = [];

  averagePrice: number | undefined;

  totalQty: number | undefined;

  option: any = {};

  constructor(
    resourceService: HateoasResourceService,
    public readonly expenseService: ExpenseItemsService,
    private readonly commodityService: CommoditiesService,
    private readonly uploadService: StorageService,
    entityService: EntityService<Commodity, CommodityGroup>,
    route: ActivatedRoute,
    router: Router,
    title: Title
  ) {
    super(Commodity, resourceService, route, router, title, entityService);
    this.image = new PhotoUploaderComponent(this.uploadService);
  }

  override onEntityLoaded(entity: Commodity) {
    if (!entity) {
      return;
    }

    this.defaultUnit = entity.unittype?.shortName;
    const moneyType$ = entity.getRelation<MoneyType>('defaultMoneyType')
      .pipe(
        catchError((err) => {
          console.log(err)
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
      totals: totals$,
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {

        if (result.moneyType) {
          this.defaultMoneyType = result.moneyType;
        }

        if (result.totals) {
          this.totalQty = result.totals;
          if (this.totalQty) {
            this.averagePrice = this.expensesSum / this.totalQty;
          }
        }
      },
      error: (err) => console.error(
        'An error occurred loading commodity data', err
      )
    });
  }

  override clearPreviousData() {
    super.clearPreviousData();

    this.defaultUnit = undefined;
    this.defaultMoneyType = undefined;
    this.totalQty = undefined;
    this.averagePrice = undefined;
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  setEntities($event: ExpenseItem[]) {
    setTimeout(() => {
      this.expenses = $event;
      this.option = this.getData();
    })
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
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
