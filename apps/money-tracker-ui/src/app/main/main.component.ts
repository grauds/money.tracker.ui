import { Component, OnInit } from '@angular/core';
import { MoneyTrackerService } from '@clematis-shared/money-tracker-service';
import { MonthlyDelta } from '@clematis-shared/model';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { PagedResourceCollection }  from '@lagoshny/ngx-hateoas-client/lib/model/resource/paged-resource-collection';
import { PageEvent } from '@angular/material/paginator';
import { of, switchMap, tap }  from 'rxjs';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  isLoggedIn?: boolean;

  monthlyDeltas: MonthlyDelta[] = []

  lastBalance: number = 0;
  waterfallRub: any;
  waterfallUsd: any;
  waterfallEur: any;
  waterfallX: string[] = [];

  total: number = 0;
  limit: number = 12;
  n: number = 0;

  error: Error | undefined;

  message: string = '';


  constructor(private moneyTrackerService: MoneyTrackerService,
              private resourceService: HateoasResourceService,
              protected readonly keycloak: KeycloakService) {
    this.keycloak.isLoggedIn().then((logged) => {
      this.isLoggedIn = logged
    })
  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData() {
    this.resourceService.getPage<MonthlyDelta>(MonthlyDelta, {
      pageParams: {
        page: this.n,
        size: this.limit
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

    this.createWaterfallChart('RUB').subscribe(chart => this.waterfallRub = chart)
    this.createWaterfallChart('EUR').subscribe(chart => this.waterfallEur = chart)
    this.createWaterfallChart('USD').subscribe(chart => this.waterfallUsd = chart)
  }

  private createWaterfallChart(code: string) {

    let deltas = this.monthlyDeltas.filter((value: MonthlyDelta) => value.code === code)
    let chart = {};

    return of(chart).pipe(
      switchMap( () => {
        if (this.monthlyDeltas.length > 0) {
          return this.moneyTrackerService.getBalance(this.monthlyDeltas[0].year, this.monthlyDeltas[0].month, code)
        }
        return of(0)
      }),
      tap((balance: number) => console.log(balance)),
      switchMap((balance: number) => {

        let currentBalance = balance ? balance : 0
        let waterfallIncome: string[] = []
        let waterfallExpenses: string[] = []
        let waterfallTotals: string[] = []

        // https://github.com/apache/echarts/issues/11885
        this.waterfallX.forEach((tick: string) => {

          let values = deltas.filter((delta) => (delta.year + '/' + delta.month) === tick)

          if (values.length > 0) {
            let value = values[0]
            if (value.delta > 0) {
              waterfallIncome.push(value.delta.toString())
              waterfallExpenses.push('0')
            } else if (value.delta < 0) {
              waterfallIncome.push('0')
              waterfallExpenses.push(value.delta.toString())
            } else {
              waterfallIncome.push('0')
              waterfallExpenses.push('0')
            }
            currentBalance += value.delta
            waterfallTotals.push(currentBalance.toString())
          } else {
            waterfallIncome.push('0')
            waterfallExpenses.push('0')
            waterfallTotals.push(currentBalance.toString())
          }

         })
         return of(this.getWaterfallChart(waterfallIncome, waterfallExpenses, waterfallTotals, code))
      })
    )
  }

  private getWaterfallChart(waterfallIncome: string[],
                            waterfallExpenses: string[],
                            waterfallTotals: string[],
                            code: string) {
    return {
      title: {
        text: 'Accumulated Waterfall Chart in ' + code
      },
      tooltip: {
        trigger: 'axis',
          axisPointer: {
          type: 'shadow'
        },
        formatter: function (params: any) {
          let tar;
          if (params[1].value !== '-') {
            tar = params[1];
          } else {
            tar = params[0];
          }
          return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
        }
      },
      legend: {
        data: ['Total', 'Expenses', 'Income']
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
          name: 'Income',
          type: 'line',
          label: {
            show: true,
            position: 'top'
          },
          data: waterfallIncome
        },
        {
          name: 'Expenses',
          type: 'line',
          label: {
            show: true,
            position: 'bottom'
          },
          data: waterfallExpenses
        }
      ]
    }
  }

  setCurrentPage($event: PageEvent) {
    this.n = $event.pageIndex
    this.limit = $event.pageSize
    if (this.n === 0) {
      this.lastBalance = 0
    }
    this.loadData();
  }
}
