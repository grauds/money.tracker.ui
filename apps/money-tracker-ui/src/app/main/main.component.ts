import { Component, OnInit } from '@angular/core';
import { AccountBalance } from '@clematis-shared/model';
import { MoneyTrackerService } from '@clematis-shared/money-tracker-service';
import { MonthlyDelta } from '@clematis-shared/model';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { PagedResourceCollection}  from '@lagoshny/ngx-hateoas-client/lib/model/resource/paged-resource-collection';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  accountsBalances: AccountBalance[] = []

  monthlyDeltas: MonthlyDelta[] = []

  lastBalance: number = 0;

  waterfall: any;
  waterfallX: string[] = [];

  total: number = 0;
  limit: number = 12;
  n: number = 0;

  optionsRub: any;
  optionsEur: any;
  optionsUsd: any;

  error: Error | undefined;

  message: string = '';


  constructor(private moneyTrackerService: MoneyTrackerService,
              private resourceService: HateoasResourceService) { }

  ngOnInit(): void {
    this.loadData()
  }

  loadData() {
    this.moneyTrackerService.getAccountsBalance((response) => {

      this.accountsBalances = response.resources

      this.optionsRub = this.getBalancesChart('Roubles', 'RUB');
      this.optionsUsd = this.getBalancesChart('Dollars', 'USD');
      this.optionsEur = this.getBalancesChart('Euros', 'EUR');

      this.loadWaterfallChart();

    }, (error) => {
      this.error = error
    })
  }

  private loadWaterfallChart() {

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
        this.processWaterfall();

        return response.resources
    })
  }

  private processWaterfall() {

    // form unique X ticks
    this.waterfallX = this.monthlyDeltas
      .filter((value: MonthlyDelta) => value.code === 'RUB')
      .map((monthlyDelta: MonthlyDelta) => {
        return monthlyDelta.year + '/' + monthlyDelta.month
      })

    let currentBalance = this.lastBalance
    let waterfallIncome: string[] = []
    let waterfallExpenses: string[] = []
    let waterfallTotals: string[] = []

    // B(n+1) = B(n) + I(n) - E(n+1)
    // https://github.com/apache/echarts/issues/11885
    this.monthlyDeltas
      .filter((value: MonthlyDelta) => value.code === 'RUB')
      .forEach((value: MonthlyDelta) => {
         if (value.delta > 0) {
           waterfallTotals.push(currentBalance.toString())
           waterfallIncome.push(value.delta.toString())
           waterfallExpenses.push('-')
           currentBalance += value.delta
         } else if (value.delta < 0) {
           currentBalance += value.delta
           waterfallIncome.push('-')
           waterfallExpenses.push(((-1) * value.delta).toString())
           waterfallTotals.push(currentBalance.toString())
         } else {
           waterfallIncome.push('-')
           waterfallExpenses.push('-')
           currentBalance += value.delta
           waterfallTotals.push(currentBalance.toString())
         }
      })

    this.lastBalance = currentBalance

    this.waterfall = this.getWaterfallChart(waterfallIncome, waterfallExpenses, waterfallTotals)
  }

  private getWaterfallChart(waterfallIncome: string[],
                            waterfallExpenses: string[],
                            waterfallTotals: string[]) {
    return {
      title: {
        text: 'Accumulated Waterfall Chart'
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
          type: 'bar',
          stack: 'Total',
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent'
          },
          emphasis: {
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent'
            }
          },
          data: waterfallTotals
        },
        {
          name: 'Income',
          type: 'bar',
          stack: 'Total',
          label: {
            show: true,
            position: 'top'
          },
          data: waterfallIncome
        },
        {
          name: 'Expenses',
          type: 'bar',
          stack: 'Total',
          label: {
            show: true,
            position: 'bottom'
          },
          data: waterfallExpenses
        }
      ]
    }
  }

  private getBalancesChart(name: string, code: string) {
    return {
      title: {
        text: 'Accounts Today in ' + name
      },
      legend: {
        data: ['Balance']
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        top: 80,
        bottom: 30
      },
      xAxis: {
        type: 'value',
        position: 'top',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'category',
        axisLine: {show: false},
        axisLabel: {show: false},
        axisTick: {show: true},
        splitLine: {show: false},
        data: this.accountsBalances
          .filter(accountBalance => accountBalance.balance != 0 && accountBalance.code === code)
          .map(accountBalance => {
            return accountBalance.name
          })
      },
      series: [
        {
          name: name,
          type: 'bar',
          stack: 'Total',
          label: {
            position: 'right',
            show: true,
            formatter: '{c} - {b}'
          },
          data: this.accountsBalances
            .filter(accountBalance => accountBalance.balance != 0 && accountBalance.code === code)
            .map((accountBalance: AccountBalance) => {
              return {
                value: accountBalance.balance
              }
            })
        }
      ]
    };
  }

  setCurrentPage($event: PageEvent) {
    this.n = $event.pageIndex
    this.limit = $event.pageSize
    if (this.n === 0) {
      this.lastBalance = 0
    }
    this.loadWaterfallChart();
  }
}
