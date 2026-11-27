import { Component, OnDestroy, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
} from '@lagoshny/ngx-hateoas-client';
import {
  Commodity,
  CommodityGroup,
  ExpenseItem,
  IncomeItem,
  PurchasePricePoint,
} from '@clematis-shared/model';
import {
  CommoditiesService,
  EntityComponent,
  ExpenseItemsService,
  IncomeItemsService,
  StorageService,
  PhotoUploaderComponent,
  PurchasePricePointsService,
  RESOURCE_TYPE,
  PARENT_RESOURCE_TYPE,
  EntityService,
  MoneyTypeService,
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';
import {
  catchError,
  EMPTY,
  forkJoin,
} from "rxjs";

@Component({
  selector: 'app-commodity',
  providers: [
    EntityService,
    { provide: RESOURCE_TYPE, useValue: Commodity },
    { provide: PARENT_RESOURCE_TYPE, useValue: CommodityGroup },
  ],
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.sass'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CommodityComponent
  extends EntityComponent<Commodity, CommodityGroup>
  implements OnDestroy
{
  image: PhotoUploaderComponent | undefined;

  income: IncomeItem[] = [];

  expenses: ExpenseItem[] = [];

  unitTypeName: string | undefined;

  averagePrice: number | undefined;

  totalQty: number | undefined;

  purchaseHistory: PurchasePricePoint[] = [];

  constructor(
    resourceService: HateoasResourceService,
    public readonly expenseService: ExpenseItemsService,
    public readonly incomeService: IncomeItemsService,
    protected override moneyTypeService: MoneyTypeService,
    private readonly commodityService: CommoditiesService,
    private readonly uploadService: StorageService,
    private readonly purchasePricePointsService: PurchasePricePointsService,
    entityService: EntityService<Commodity, CommodityGroup>,
    route: ActivatedRoute,
    router: Router,
    title: Title,
  ) {
    super(
      Commodity,
      resourceService,
      moneyTypeService,
      route,
      router,
      title,
      entityService,
    );
    this.image = new PhotoUploaderComponent(this.uploadService);
  }

  override onEntityLoaded(entity: Commodity) {
    if (!entity) {
      return;
    }

    this.unitTypeName = entity.unittype?.shortName;

    const totals$ = this.commodityService.getTotalQtyForCommodity(this.id).pipe(
      catchError((err) => {
        console.log(err);
        return EMPTY;
      }),
    );

    forkJoin({
      totals: totals$,
      purchaseHistory: this.purchasePricePointsService.getByCommodity(this.id),
    }).subscribe({
      next: (result) => {
        if (result.totals) {
          this.totalQty = result.totals;
          if (this.totalQty) {
            this.averagePrice = this.expensesSum / this.totalQty;
          }
        }
        if (result.purchaseHistory) {
          this.purchaseHistory = result.purchaseHistory;
        }
      },
      error: (err) =>
        console.error('An error occurred loading commodity data', err),
    });
  }

  override clearPreviousData() {
    super.clearPreviousData();

    this.unitTypeName = undefined;
    this.totalQty = undefined;
    this.averagePrice = undefined;
    this.purchaseHistory = [];
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  setIncome($event: IncomeItem[]) {
    setTimeout(() => {
      this.income = $event;
    });
  }

  setExpenses($event: ExpenseItem[]) {
    setTimeout(() => {
      this.expenses = $event;
    });
  }
}
