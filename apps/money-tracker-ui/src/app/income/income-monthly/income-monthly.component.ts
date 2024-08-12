import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, of, Subscription, switchMap } from "rxjs";
import { KeycloakService } from "keycloak-angular";

import {
  PagedResourceCollection,
  ResourceCollection
} from "@lagoshny/ngx-hateoas-client";

import { IncomeMonthly, MoneyType } from "@clematis-shared/model";
import { 
  IncomeItemsService, 
  MoneyTypeService 
} from "@clematis-shared/shared-components";

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";

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
  selector: 'app-income-monthly',
  templateUrl: './income-monthly.component.html',
  styleUrls: ['./income-monthly.component.sass'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
  encapsulation: ViewEncapsulation.None,
})
export class IncomeMonthlyComponent implements OnInit {

  chart: any;

  pageSubscription: Subscription;

  loading = false;

  currency: MoneyType = new MoneyType();

  currencies: MoneyType[] = [];

  startDate = moment().add(-6, 'M');

  endDate = moment().add(1, 'M');

  income: Array<IncomeMonthly> = [];

  isLoggedIn: boolean = false;

  constructor(protected readonly keycloak: KeycloakService,
              private moneyTypeService: MoneyTypeService,
              private incomeItemsService: IncomeItemsService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title) {

    this.isLoggedIn = this.keycloak.isLoggedIn();

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
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
    let series: Map<string, IncomeMonthly[]> = new Map();

    return of(chart).pipe(
      switchMap(() => {
        return this.incomeItemsService.getIncomeInCurrency(
          this.currency,
          this.startDate.month(), this.startDate.year(),
          this.endDate.month(), this.endDate.year())
      }),
      switchMap((response: ResourceCollection<IncomeMonthly>) => {
        return of(response.resources)
      }),
      switchMap((resources: IncomeMonthly[]) => {

        // form series of data in the interval
        resources.forEach((incomeMonthly: IncomeMonthly) => {
          if (incomeMonthly.name) {
            let values: IncomeMonthly[] = []
            if (series.get(incomeMonthly.name)) {
              values = series.get(incomeMonthly.name)!
            }
            values.push(incomeMonthly)
            series.set(incomeMonthly.name, values)
          }
        })

        // form unique ticks
        ticks = resources.map((incomeReport: IncomeMonthly) => {
          return incomeReport.year + '/' + incomeReport.month
        }).filter((value, index, self) => self.indexOf(value) === index)

        return of(0)
      }),
      switchMap(() => {
        return of(this.buildChart(ticks, series, moneyType))
      })
    )
  }

  private getChartsSeries(ticks: string[], series: Map<string, IncomeMonthly[]>): any[] {
    let chartSeries: any[] = []
    series.forEach((incomeMonthly: IncomeMonthly[], name: string) => {
      return chartSeries.push({
        name: name,
        type: "bar",
        stack: "total",
        emphasis: {
          focus: "series",
          label: {
            show: true
          }
        },
        data: ticks.map((tick) => {
          return incomeMonthly.find((value: IncomeMonthly) => {
            return (value.year + '/' + value.month) === tick
          })?.totalConverted
        })
      });
    })
    return chartSeries
  }

  private buildChart(ticks: string[],
                     series: Map<string, IncomeMonthly[]>,
                     moneyType: MoneyType) {

    return {
      legend: {
        backgroundColor: 'rgba(206,206,206,0.7)',
        type: 'scroll',
        right: 10,
        top: 20,
        bottom: 20,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        position: function (pos: number[], params: any, el: any, elRect: any, 
          size: { viewSize: number[]; }) {
          var obj: any = { top: 10 };
          obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          return obj;
        },
        formatter: function (params: any[]) {
          let output = params[0].axisValueLabel + '<br/>';
          output += '<table class="w-full">';
  
          const sorted: any[] = params.sort((paramA, paramB) => paramB.value - paramA.value);
          sorted.forEach(function (param) {
            if (param.value > 0) {
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
      xAxis: {
        type: 'category',
        data: ticks
      },
      yAxis: {
        type: 'value'
      },
      series: this.getChartsSeries(ticks, series)
    };
  }
}
