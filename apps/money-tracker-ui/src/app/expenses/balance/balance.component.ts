import { Component, OnInit } from '@angular/core';
import { AccountsService } from "@clematis-shared/shared-components";
import { MoneyTypes, MonthlyDelta } from '@clematis-shared/model';
import { HateoasResourceService, PagedResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { catchError, of, Subscription, switchMap, tap } from "rxjs";
import { KeycloakService } from 'keycloak-angular';
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.sass']
})
export class BalanceComponent implements OnInit {

  isLoggedIn?: boolean;

  waterfall: any;

  // total number of elements
  total: number = 0;

  // number of records per page
  limit: number = 12;

  // current page number counter
  n: number | undefined = undefined;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  message: string = '';

  loading = false;

  currency: MoneyTypes = MoneyTypes.RUB;

  currencies = [MoneyTypes.RUB,
    MoneyTypes.GBP,
    MoneyTypes.EUR,
    MoneyTypes.USD
  ];

  startDate: string = '';

  endDate: string = '';


  constructor(private accountsService: AccountsService,
              private resourceService: HateoasResourceService,
              protected readonly keycloak: KeycloakService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title) {

    this.keycloak.isLoggedIn().then((logged) => {
      this.isLoggedIn = logged
    })

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const page = Number.parseInt(queryParam['page'], 10)
        this.n = isNaN(page) ? undefined : page;
        const size = Number.parseInt(queryParam['size'], 10)
        this.limit = isNaN(size) ? 12 : size;
        const currency: String = queryParam['currency']
        if (currency) {
          this.currency = MoneyTypes[currency as keyof typeof MoneyTypes]
        }
        this.ngOnInit();
      }
    );
  }

  ngOnInit(): void {
    this.loadData(this.currency)
    this.title.setTitle('Currencies')
  }

  setCurrentPage(pageIndex: number, pageSize: number) {
    this.n = pageIndex
    this.limit = pageSize
    this.updateCurrencyOrPage(this.currency)
  }

  updateCurrencyOrPage($event: MoneyTypes) {
    this.loadData($event)
    this.updateRoute()
  }

  updateRoute() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.n,
        size: this.limit,
        currency: this.currency
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    })
  }

  loadData(code: MoneyTypes) {
    this.loading = true
    this.createChart(code).subscribe(chart => this.waterfall = chart)
  }

  private createChart(code: MoneyTypes) {

    let chart = {};

    // form unique X ticks
    let waterfallX: string[] = []
    let monthlyDeltas: MonthlyDelta[] = []

    return of(chart).pipe(
      switchMap(() => {
        return this.resourceService.searchPage<MonthlyDelta>(MonthlyDelta, 'history', {
          params: {
            code: code
          },
          pageParams: {
            page: 0,
            size: this.limit,
          }
        })
      }),
      switchMap((response: PagedResourceCollection<MonthlyDelta>) => {

        this.limit = response.pageSize
        this.total = response.totalElements
        let n = (this.n !== undefined) ? this.n : (response.totalPages - 1)

        return this.resourceService.searchPage<MonthlyDelta>(MonthlyDelta, 'history', {
          params: {
            code: code
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
        monthlyDeltas = resources.filter((value: MonthlyDelta) => value.code === code)

        // form unique ticks
        waterfallX = resources.map((monthlyDelta: MonthlyDelta) => {
          return monthlyDelta.year + '/' + monthlyDelta.month
        }).filter((value, index, self) => self.indexOf(value) === index)

        // the starting value for the graph fragment
        if (resources.length > 0) {
          console.log('Frame balance: ' + monthlyDeltas[0].year + ' ' + monthlyDeltas[0].month)
          return this.accountsService.getBalance(monthlyDeltas[0].year, monthlyDeltas[0].month, code)
        }

        return of(0)
      }),
      tap((balance: number) => console.log('Frame balance: ' + balance)),
      switchMap((balance: number) => {

        let currentBalance = balance ? balance : 0
        let waterfallDelta: string[] = []
        let waterfallTotals: string[] = []

        // https://github.com/apache/echarts/issues/11885
        waterfallX.forEach((tick: String) => {

          let values = monthlyDeltas.filter((delta) => (delta.year + '/' + delta.month) === tick)

          if (values.length > 0) {
            let value = values[0]
            waterfallDelta.push(value.delta.toString())
            currentBalance += value.delta
          } else {
            waterfallDelta.push('0')
          }
          waterfallTotals.push(currentBalance.toString())

        })
        return of(this.buildChart(waterfallX, waterfallDelta, waterfallTotals, code))
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
                      code: MoneyTypes) {

    this.startDate = waterfallX[0]
    this.endDate = waterfallX[waterfallX.length - 1]
    this.loading = false

    this.currency = code

    return {
      title: {
        text: 'Monthly Balance ' + code
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