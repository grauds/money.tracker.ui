import {Component, OnInit} from '@angular/core';
import {MoneyTrackerService} from '@clematis-shared/money-tracker-service';
import {MoneyTypes, MonthlyDelta} from '@clematis-shared/model';
import {HateoasResourceService} from '@lagoshny/ngx-hateoas-client';
import {PagedResourceCollection} from '@lagoshny/ngx-hateoas-client/lib/model/resource/paged-resource-collection';
import {PageEvent} from '@angular/material/paginator';
import {of, Subscription, switchMap, tap} from 'rxjs';
import {KeycloakService} from 'keycloak-angular';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  isLoggedIn?: boolean;

  monthlyDeltas: MonthlyDelta[] = []

  waterfall: any;

  waterfallX: string[] = [];

  // total number of elements
  total: number = 0;

  // number of records per page
  limit: number = 12;

  // current page number counter
  n: number = 0;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  error: Error | undefined;

  message: string = '';

  loading = false;

  currency: MoneyTypes = MoneyTypes.RUB;

  currencies = [MoneyTypes.RUB,
    MoneyTypes.GBP,
    MoneyTypes.CSZ,
    MoneyTypes.EUR,
    MoneyTypes.USD
  ];


  constructor(private moneyTrackerService: MoneyTrackerService,
              private resourceService: HateoasResourceService,
              protected readonly keycloak: KeycloakService,
              private router: Router,
              private route: ActivatedRoute) {

    this.keycloak.isLoggedIn().then((logged) => {
      this.isLoggedIn = logged
    })

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const page = Number.parseInt(queryParam['page'], 10)
        this.n = isNaN(page) ? 0 : page;
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
    this.loadData()
  }

  setCurrentPage(event: PageEvent) {
    this.n = event.pageIndex
    this.limit = event.pageSize
    this.updateRoute()
    this.loadData()
  }

  updateCurrency($event: MoneyTypes) {
    this.currency = $event
    this.updateRoute()
    this.loadData()
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

  loadData() {

    this.resourceService.getPage<MonthlyDelta>(MonthlyDelta, {
      pageParams: {
        page: this.n,
        size: this.limit
      },
      sort: {
        'key.an': "DESC",
        'key.mois': "DESC"
      }
    }).subscribe((response: PagedResourceCollection<MonthlyDelta>) => {

      this.limit = response.pageSize
      this.total = response.totalElements
      this.n = response.pageNumber
      this.monthlyDeltas = response.resources

      this.processWaterfall()

    })
  }

  private processWaterfall() {

    // form unique X ticks
    this.waterfallX = this.monthlyDeltas
      .map((monthlyDelta: MonthlyDelta) => {
        return monthlyDelta.year + '/' + monthlyDelta.month
      }).filter((value, index, self) => self.indexOf(value) === index)

    this.createWaterfallChart(this.currency).subscribe(chart => this.waterfall = chart)
  }

  private createWaterfallChart(code: MoneyTypes) {

    let deltas = this.monthlyDeltas.filter((value: MonthlyDelta) => value.code === code)
    let chart = {};

    return of(chart).pipe(
      switchMap( () => {
        if (this.monthlyDeltas.length > 0) {
          return this.moneyTrackerService.getBalance(this.monthlyDeltas[0].year, this.monthlyDeltas[0].month, code)
        }
        return of(0)
      }),
      tap((balance: number) => console.log('Frame balance: ' + balance)),
      switchMap((balance: number) => {

        let currentBalance = balance ? balance : 0
        let waterfallDelta: string[] = []
        let waterfallTotals: string[] = []

        // https://github.com/apache/echarts/issues/11885
        this.waterfallX.forEach((tick: string) => {

          let values = deltas.filter((delta) => (delta.year + '/' + delta.month) === tick)

          if (values.length > 0) {
            let value = values[0]
            waterfallDelta.push(value.delta.toString())
            currentBalance -= value.delta
          } else {
            waterfallDelta.push('0')
          }
          waterfallTotals.push(currentBalance.toString())

         })
         return of(this.getWaterfallChart(waterfallDelta, waterfallTotals, code))
      })
    )
  }

  private getWaterfallChart(waterfallDelta: string[],
                            waterfallTotals: string[],
                            code: string) {
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
          } return 'No params'
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
          data: this.waterfallX
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
