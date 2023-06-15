import { Component, OnInit } from '@angular/core';
import { AccountsService, MoneyTypeService } from "@clematis-shared/shared-components";
import { MoneyType, MonthlyDelta } from "@clematis-shared/model";
import { HateoasResourceService, PagedResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { catchError, of, Subscription, switchMap, tap } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.sass']
})
export class BalanceComponent implements OnInit {

  chart: any;

  // total number of elements
  total: number = 0;

  // number of records per page
  limit: number = 12;

  // current page number counter
  n: number = 0;

  pageSubscription: Subscription;

  message: string = '';

  loading = false;

  currency: MoneyType = new MoneyType();

  currencies: MoneyType[] = [];

  startDate: string = '';

  endDate: string = '';

  constructor(private accountsService: AccountsService,
              private resourceService: HateoasResourceService,
              private moneyTypeService: MoneyTypeService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title) {

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const page = Number.parseInt(queryParam['page'], 10)
        this.n = isNaN(page) ? 0 : page;
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
    this.title.setTitle('Balance Monthly')
  }

  setCurrentPage(pageIndex: number, pageSize?: number) {
    this.n = pageIndex
    if (pageSize) {
      this.limit = pageSize
    }
    return this.updateRoute();
  }

  updateCurrency($event: MoneyType) {
    this.currency = $event;
    return this.updateRoute();
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
        this.getData(this.currency)
          .subscribe(chart => this.chart = chart)
      },
      error: () => {
      }
    });
  }

  private getData(moneyType: MoneyType) {

    let xAxis: string[] = []
    let yAxis: MonthlyDelta[] = []

    return this.resourceService.searchPage<MonthlyDelta>(MonthlyDelta, 'history', {
          params: {
            code: moneyType.code
          },
          pageParams: {
            page: 0,
            size: this.limit,
          }
        })
      .pipe(
        switchMap((response: PagedResourceCollection<MonthlyDelta>) => {

          this.limit = response.pageSize
          this.total = response.totalElements

          let totalPages = response.totalPages
          let n = (this.n !== undefined && this.n < totalPages) ? this.n : (totalPages - 1)

          return this.resourceService.searchPage<MonthlyDelta>(MonthlyDelta, 'history', {
            params: {
              code: moneyType.code
            },
            pageParams: {
              page: n,
              size: this.limit,
            }
          })
        }),
        switchMap((response: PagedResourceCollection<MonthlyDelta>) => {
          this.n = response.pageNumber
          return of(response.resources)
        }),
        switchMap((resources: MonthlyDelta[]) => {

          // filter out any other currencies
          yAxis = resources.filter((value: MonthlyDelta) => value.code === moneyType.code)

          // form unique ticks
          xAxis = resources.map((monthlyDelta: MonthlyDelta) => {
            return monthlyDelta.year + '/' + monthlyDelta.month
          }).filter((value, index, self) => self.indexOf(value) === index)

          // the starting value for the graph fragment
          if (resources.length > 0) {
            return this.accountsService.getBalance(yAxis[0].year, yAxis[0].month, moneyType.code)
          }

          return of(0)
        }),
        tap((balance: number) => console.log('Frame balance: ' + balance)),
        switchMap((balance: number) => {

          let currentBalance = balance ? balance : 0
          let deltas: string[] = []
          let totals: string[] = []

          // https://github.com/apache/echarts/issues/11885
          xAxis.forEach((tick: String) => {

            let values = yAxis.filter((delta) => (delta.year + '/' + delta.month) === tick)

            if (values.length > 0) {
              let value = values[0]
              deltas.push(value.delta.toString())
              currentBalance += value.delta
            } else {
              deltas.push('0')
            }
            totals.push(currentBalance.toString())

          })
          return of(this.buildChart(xAxis, deltas, totals, moneyType))
        }),
        catchError((err: Error) => {
          this.loading = false
          throw err
        })
      )
  }

  private buildChart(waterfallX: string[],
                      waterfallDelta: string[],
                      waterfallTotals: string[],
                      moneyType: MoneyType) {

    this.startDate = waterfallX[0]
    this.endDate = waterfallX[waterfallX.length - 1]
    this.loading = false

    this.currency = moneyType

    return {
      title: {
        text: 'Monthly Balance in ' + moneyType.name
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params: any) {
          if (params) {
            return params.map((param: any) => {
              return param.seriesName + ' : ' + Math.round(param.value * 100) / 100
            }).join('<br/>')
          }
          return 'No params'
        }
      },
      legend: {
        data: ['Total', 'Monthly Balance']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: waterfallX
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Total',
          type: 'line',
          data: waterfallTotals
        },
        {
          name: 'Monthly Balance',
          type: 'bar',
          label: {
            show: true,
            position: 'top'
          },
          data: waterfallDelta
        }
      ]
    }
  }
}
