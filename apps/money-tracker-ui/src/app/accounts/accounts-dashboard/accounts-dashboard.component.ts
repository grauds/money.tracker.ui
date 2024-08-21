import { Component, OnInit } from "@angular/core";
import { AccountBalance, MoneyType } from "@clematis-shared/model";
import { BehaviorSubject, Subscription } from "rxjs";
import {
  PagedResourceCollection,
  ResourceCollection
} from "@lagoshny/ngx-hateoas-client";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { 
  AccountsService,
  MoneyTypeService 
} from "@clematis-shared/shared-components";

@Component({
  selector: "app-accounts-dashboard",
  templateUrl: "./accounts-dashboard.component.html",
  styleUrls: ["./accounts-dashboard.component.sass"]
})
export class AccountsDashboardComponent implements OnInit {

  chart: any;

  // total sum in the chosen currency
  total: number = 0;

  // total sum week ago in the chosen currency
  totalWeekAgo: number = 0;

  // number of records per page
  limit: number = 12;

  // current page number counter
  n: number | undefined = undefined;

  accountsBalances: AccountBalance[] = [];

  pageSubscription: Subscription;

  loading = false;

  totalsLoading = false;

  totalsHistoryLoading = false;

  currency: MoneyType = new MoneyType();

  currencies: MoneyType[] = [];

  filterZerosOut: boolean = true;

  filterZerosOutEvent = new BehaviorSubject<boolean>(true);

  checkSubscription = this.filterZerosOutEvent.asObservable();

  constructor(private accountsService: AccountsService,
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

    this.checkSubscription.subscribe(() => {
      this.chart = this.getBalancesChart(this.currency);
    })
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

  onFilterEvent(data: boolean) {
    this.filterZerosOutEvent.next(data);
  }

  ngOnInit(): void {
    this.title.setTitle("Accounts");
  }

  calculateBarHight(): string {

    const filtered = this.filter()

    if (filtered) {

        if (filtered.length > 0 && filtered.length < 6) {
          return (filtered.length * 40 + 'px');
        } else if (filtered.length >= 6 && filtered.length <= 25) {
          return (filtered.length * 30 + 'px');
        } else {
          return (filtered.length * 20 + 'px');
        }

    } else {
      return '600px';
    }

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
            this.getAccountsTotalWeekAgoInCurrency();
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

  private getAccountsTotalWeekAgoInCurrency() {

    this.totalsHistoryLoading = true;
    this.accountsService.getAccountsTotalHistoryInCurrency(this.currency, 7)
      .subscribe({
        next: (total: number) => {
          this.totalWeekAgo = total;
        }, error: () => {
          this.totalWeekAgo = 0;
        }, complete: () => {
          this.totalsHistoryLoading = false;
        }
      });
  }

  private getBalancesChart(moneyType: MoneyType) {
    return {      
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: false
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
        data: this
          .filter()
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
          data: this
            .filter()
            .map((accountBalance: AccountBalance) => {
              return {
                value: accountBalance.balance
              };
            })
        }
      ]
    };
  }

  private filter() {
    return this.accountsBalances.filter((accountBalance: AccountBalance) => {
      return this._filter(accountBalance)
    })
  }

  private _filter(accountBalance: AccountBalance): boolean {
    return (!this.filterZerosOut && accountBalance.balance == 0)
      || accountBalance.balance != 0;
  }
}
