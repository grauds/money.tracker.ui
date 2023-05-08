import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MoneyType } from "@clematis-shared/model";
import { ActivatedRoute, Router } from "@angular/router";
import { of, Subscription } from "rxjs";
import { MoneyTypeService } from "@clematis-shared/shared-components";
import { PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";

@Component({
  selector: 'app-income-monthly',
  templateUrl: './income-monthly.component.html',
  styleUrls: ['./income-monthly.component.sass'],
})
export class IncomeMonthlyComponent implements OnInit {

  chart: any;

  // total number of elements
  total: number = 0;

  // number of records per page
  limit: number = 12;

  // current page number counter
  n: number | undefined = undefined;

  pageSubscription: Subscription;

  currency: MoneyType = new MoneyType();

  currencies: MoneyType[] = [];

  startDate: string = '';

  endDate: string = '';

  loading = false;

  constructor(private moneyTypeService: MoneyTypeService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title) {

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const page = Number.parseInt(queryParam['page'], 10)
        this.n = isNaN(page) ? undefined : page;
        const size = Number.parseInt(queryParam['size'], 10)
        this.limit = isNaN(size) ? 12 : size;
        this.initMoneyType(queryParam['currency'], 'RUB')
          .subscribe((result: MoneyType) => {
            this.currency = result;
            this.loadData()
          });
      }
    );
  }

  initMoneyType(destCurrency: string, fallback: string) {
    if (!destCurrency) {
      destCurrency = fallback
    }
    return this.moneyTypeService.getCurrencyByCode(destCurrency)
  }

  ngOnInit(): void {
    this.title.setTitle('Income')
  }

  setCurrentPage(pageIndex: number, pageSize: number) {
    this.n = pageIndex
    this.limit = pageSize
    this.updateCurrency(this.currency)
  }

  updateCurrency($event: MoneyType) {
    this.currency = $event;

    this.updateRoute().then(() => {
      this.loadData()
    });
  }

  updateRoute() {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.n,
        size: this.limit,
        currency: this.currency.code
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    })
  }

  loadData() {
    this.loading = true

    this.moneyTypeService.getPage({
      pageParams: {
        page: 0,
        size: 200
      }
    }).subscribe({
      next: (response: PagedResourceCollection<MoneyType>) => {
        this.currencies = response.resources;
        this.createChart(this.currency)
          .subscribe((chart: any) => this.chart = chart)
      },
      error: () => {
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private createChart(moneyType: MoneyType) {
    let chart = {};

    return of(chart)
  }

}
