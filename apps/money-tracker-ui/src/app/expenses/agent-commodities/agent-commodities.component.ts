import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription, switchMap } from 'rxjs';

import { KeycloakService } from 'keycloak-angular';
import { PagedResourceCollection } from '@lagoshny/ngx-hateoas-client';

import { AgentCommodities, MoneyType, Page } from '@clematis-shared/model';
import { ExpenseItemsService, MoneyTypeService } from '@clematis-shared/shared-components';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-agent-commodities',
  templateUrl: './agent-commodities.component.html',
  styleUrl: './agent-commodities.component.sass',
})
export class AgentCommoditiesComponent implements OnInit {

  chart: any;

  pageSubscription: Subscription;

  isLoggedIn: boolean = false;

  loading = false;

  currency: MoneyType = new MoneyType();

  currencies: MoneyType[] = [];

  startDate = moment().add(-6, 'M');

  endDate = moment().add(1, 'M');

  constructor(protected readonly keycloak: KeycloakService,
              private moneyTypeService: MoneyTypeService,
              private expenseItemsService: ExpenseItemsService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title) {

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        this.initMoneyType(queryParam['currency'], 'RUB')
          .subscribe((result: MoneyType) => {
            this.currency = result;
            this.loadData()
          });
      }
    );

    this.isLoggedIn = this.keycloak.isLoggedIn();
  }

  initMoneyType(destCurrency: string, fallback: string) {
    if (!destCurrency) {
      destCurrency = fallback
    }
    return this.moneyTypeService.getCurrencyByCode(destCurrency)
  }

  ngOnInit(): void {
    this.title.setTitle('Users Commodities')
  }

  updateCurrency($event: MoneyType) {
    this.currency = $event;

    this.updateRoute().then(() => {
      this.loadData()
    });
  }

  updateStartDate(normalizedMonthAndYear: moment.Moment) {
    this.startDate.month(normalizedMonthAndYear.month());
    this.startDate.year(normalizedMonthAndYear.year());
    this.loadData();
  }

  updateEndDate(normalizedMonthAndYear: moment.Moment) {
    this.endDate.month(normalizedMonthAndYear.month());
    this.endDate.year(normalizedMonthAndYear.year());
    this.loadData();
  }

  updateRoute() {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        currency: this.currency.code
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    })
  }

  loadData() {
    this.loading = true;

    this.moneyTypeService.getPage({
      pageParams: {
        page: 0,
        size: 200
      }
    }).subscribe({
      next: (response: PagedResourceCollection<MoneyType>) => {
        this.currencies = response.resources;
        this.createChart(this.currency)
          .subscribe(chart => {
            this.chart = chart;
            this.loading = false;
          })
      },
      error: () => {
      },
      complete: () => {
      }
    });
  }  

  private createChart(moneyType: MoneyType): Observable<any> {
    let chart = {};

    let ticks: string[] = []
    let series: Map<string, AgentCommodities[]> = new Map();

    return of(chart).pipe(
      switchMap(() => {
        return this.expenseItemsService.getAgentExpencesInCurrency(
          this.currency,
          this.startDate.month(), this.startDate.year(),
          this.endDate.month(), this.endDate.year())        
      }),
      switchMap((response: Page<AgentCommodities>) => {
        return of(response.content)
      }),
      switchMap((response: AgentCommodities[]) => {

        // form series of data in the interval
        response.forEach((month: AgentCommodities) => {
          if (month.agent && month.commodityGroup) {
            const key = month.agent + " " + month.commodityGroup;
            let values: AgentCommodities[] = []
            if (series.get(key)) {
              values = series.get(key)!
            }
            values.push(month)
            series.set(key, values)
          }
        })

        // form unique ticks
        ticks = response.map((month: AgentCommodities) => {
          return month.an + '/' + month.mois
        }).filter((value, index, self) => self.indexOf(value) === index)

        return of(0)
      }),
      switchMap(() => {
        return of(this.buildChart(ticks, series, moneyType))
      })
    
    )
  }

  private getChartsSeries(ticks: string[], series: Map<string, AgentCommodities[]>): any[] {
    let chartSeries: any[] = []

    series.forEach((commoditiesMonthly: AgentCommodities[], name: string) => {
      return chartSeries.push({
        name: name,
        type: "line",
        stack: "total",
        areaStyle: {},
        emphasis: {
          focus: "series",
          label: {
            show: true
          }
        },
        data: ticks.map((tick) => {
          const ac: AgentCommodities | undefined 
           = commoditiesMonthly.find((value: AgentCommodities) => {
            return (value.an + '/' + value.mois) === tick
          })
          return ac ? ac.total : 0
        })
      });
    })
    
    return chartSeries
  }

  private buildChart(ticks: string[],
                    series: Map<string, AgentCommodities[]>,
                    moneyType: MoneyType) {
  
    return {
      title: {
        text: 'Users\' Commodities in ' + moneyType.code
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        order: 'valueDesc',
        formatter: function (params: any[]) {
          let output = params[0].axisValueLabel + '<br/>';
          output += '<table class="w-full">';
  
          const sorted: any[] = params.sort((paramA, paramB) => paramB.value - paramA.value);
          sorted.forEach(function (param) {
            if (param.value !== 0) {
              output += `<tr>
                <td>${param.marker}</td>
                <td>${param.seriesName}</td>
                <td class="text-right font-bold tabular-nums">${param.value}</td>
              </tr>`;
            }
          });
  
          return output + '</table>';
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: ticks
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: this.getChartsSeries(ticks, series)
    };

  }
}
