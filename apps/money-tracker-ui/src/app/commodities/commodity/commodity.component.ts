import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
} from '@lagoshny/ngx-hateoas-client';
import {
  Commodity,
  CommodityGroup,
  ExpenseItem,
  IncomeItem
} from '@clematis-shared/model';
import {
  CommoditiesService,
  EntityComponent,
  ExpenseItemsService,
  IncomeItemsService,
  StorageService,
  PhotoUploaderComponent,
  RESOURCE_TYPE,
  PARENT_RESOURCE_TYPE,
  EntityService
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';
import {
  catchError,
  EMPTY,
  forkJoin,
} from "rxjs";

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.sass'],
  providers: [
    EntityService,
    { provide: RESOURCE_TYPE, useValue: Commodity },
    { provide: PARENT_RESOURCE_TYPE, useValue: CommodityGroup },
  ],
  standalone: false,
})
export class CommodityComponent
  extends EntityComponent<Commodity, CommodityGroup>
  implements OnDestroy
{
  unitTypeName: string | undefined;

  image: PhotoUploaderComponent | undefined;

  income: IncomeItem[] = [];

  expenses: ExpenseItem[] = [];

  averagePrice: number | undefined;

  totalQty: number | undefined;

  constructor(
    resourceService: HateoasResourceService,
    public readonly expenseService: ExpenseItemsService,
    public readonly incomeService: IncomeItemsService,
    private readonly commodityService: CommoditiesService,
    private readonly uploadService: StorageService,
    entityService: EntityService<Commodity, CommodityGroup>,
    route: ActivatedRoute,
    router: Router,
    title: Title,
  ) {
    super(Commodity, resourceService, route, router, title, entityService);
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
    }).subscribe({
      next: (result) => {
        if (result.totals) {
          this.totalQty = result.totals;
          if (this.totalQty) {
            this.averagePrice = this.expensesSum / this.totalQty;
          }
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
