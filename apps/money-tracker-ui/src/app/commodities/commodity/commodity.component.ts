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
  ExpenseItem,
  Entity,
  Utils,
} from '@clematis-shared/model';
import {
  CommoditiesService,
  CommodityGroupService,
  EntityComponent,
  ExpenseItemsService,
  StorageService,
  PhotoUploaderComponent
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { catchError, EMPTY } from "rxjs";

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.sass'],
  providers: [
    { provide: 'searchService', useClass: ExpenseItemsService }
  ],
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

  path: Array<CommodityGroup> = [];

  totalSum = 0;

  expenses: ExpenseItem[] = [];

  loading = false;

  averagePrice: number | undefined;

  totalQty: number | undefined;

  option: any = {};

  constructor(
    resourceService: HateoasResourceService,
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

    this.defaultUnit = this.entity?.unittype?.shortName;

    this.entity?.getRelation<MoneyType>('defaultMoneyType')
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
            // this item in the planning state, to real transaction (yet)
            return EMPTY;
          }
          throw err;
        })
      ).subscribe((defaultMoneyType: MoneyType) => {
        this.defaultMoneyType = defaultMoneyType;
      });

    this.entity?.getRelation<CommodityGroup>('parent')
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
            // No parent is a valid state → don’t show an error to the user
            this.parent = undefined;
            this.parentLink = undefined;
            return EMPTY;
          }
          // Other errors are real problems → let them propagate (or handle differently)
          throw err;
        })
      )
      .subscribe((parent: CommodityGroup) => {
        this.parent = parent;
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent);
        this.commodityGroupService
          .getPathForCommodityGroup(Utils.getIdFromSelfUrl(this.parent))
          .subscribe((response) => {
            this.path = response.resources.reverse();
            if (this.parent) {
              this.path.push(this.parent);
            }
          });
      });

    this.commodityService
      .getTotalQtyForCommodity(this.id)
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
             // this item in the planning state, to real transaction (yet)
            return EMPTY;
          }
          throw err;
        })
      ).subscribe((response) => {
        this.totalQty = response;

        this.commodityService
          .getTotalsForCommodity(this.id, MoneyTypes.RUB)
          .subscribe((response) => {
            this.totalSum = response;

            if (this.totalQty) {
              this.averagePrice = this.totalSum / this.totalQty;
            }
          });
      });
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
