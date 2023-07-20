import { Component, OnInit } from "@angular/core";
import { AccountBalance, MoneyType } from "@clematis-shared/model";
import { Subscription } from "rxjs";
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection
} from "@lagoshny/ngx-hateoas-client";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { AccountsService } from "@clematis-shared/shared-components";
import { MoneyTypeService } from "@clematis-shared/shared-components";

@Component({
  selector: "app-accounts-dashboard",
  templateUrl: "./accounts-dashboard.component.html",
  styleUrls: ["./accounts-dashboard.component.sass"]
})
export class AccountsDashboardComponent implements OnInit {

  chart: any;

  // total number of elements
  total: number = 0;

  // number of records per page
  limit: number = 12;

  // current page number counter
  n: number | undefined = undefined;

  accountsBalances: AccountBalance[] = [];

  pageSubscription: Subscription;

  loading = false;

  totalsLoading = false;

  currency: MoneyType = new MoneyType();

  currencies: MoneyType[] = [];

  constructor(private accountsService: AccountsService,
              private resourceService: HateoasResourceService,
              private moneyTypeService: MoneyTypeService,
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

  onChartEvent(event: any, type: string) {
    console.log("chart event:", type, event);
  }

  ngOnInit(): void {
    this.title.setTitle("Accounts");
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

    this.moneyTypeService.getPage({
      pageParams: {
        page: 0,
        size: 200
      }
    }).subscribe({
      next: (response: PagedResourceCollection<MoneyType>) => {
          this.currencies = response.resources;
          this.getAccountsBalanceInCurrency();
        },
      error: () => {
      }
    });
  }

  private getAccountsBalanceInCurrency() {

    this.loading = true
    this.totalsLoading = true;

    this.accountsService.getAccountsBalanceInCurrency(this.currency)
      .subscribe({
          next: (response: ResourceCollection<AccountBalance>) => {
            this.accountsBalances = response.resources;
            this.getAccountsTotalInCurrency();
            this.chart = this.getBalancesChart(this.currency);
          },
          error: () => {
          },
          complete: () => {
            this.loading = false;
          }
        }
      );
  }

  private getAccountsTotalInCurrency() {

    this.totalsLoading = true;
    this.accountsService.getAccountsTotalInCurrency(this.currency)
      .subscribe({
        next: (total: number) => {
          this.total = total;
        }, error: () => {
          this.total = 0;
        }, complete: () => {
          this.totalsLoading = false;
        }
      });
  }

  private getBalancesChart(moneyType: MoneyType) {
    return {
      title: {
        text: "Accounts Today in " + moneyType.name
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        top: 80,
        bottom: 30
      },
      xAxis: {
        type: "value",
        position: "top",
        splitLine: {
          lineStyle: {
            type: "dashed"
          }
        }
      },
      yAxis: {
        type: "category",
        axisLine: { show: false },
        axisLabel: { show: false },
        axisTick: { show: true },
        splitLine: { show: false },
        data: this.accountsBalances
          .map(accountBalance => {
            return accountBalance.name;
          })
      },
      series: [
        {
          name: moneyType.name,
          type: "bar",
          stack: "Total",
          label: {
            position: "right",
            show: true,
            formatter: "{c} - {b}"
          },
          select: {
            itemStyle: {
              shadowColor: "rgba(0, 0, 0, 0.5)",
              shadowBlur: 10
            }
          },
          selectedMode: "single",
          data: this.accountsBalances
            .map((accountBalance: AccountBalance) => {
              return {
                value: accountBalance.balance
              };
            })
        }
      ]
    };
  }
}
