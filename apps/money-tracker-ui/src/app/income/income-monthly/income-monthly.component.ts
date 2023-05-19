import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { of, Subscription, switchMap } from "rxjs";

import {
  PagedResourceCollection,
  ResourceCollection
} from "@lagoshny/ngx-hateoas-client";

import { IncomeMonthly, MoneyType } from "@clematis-shared/model";
import { IncomeItemsService } from "@clematis-shared/shared-components";
import { MoneyTypeService } from "@clematis-shared/shared-components";
import { FormControl } from "@angular/forms";
import { MatDatepicker } from "@angular/material/datepicker";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment, Moment} from 'moment';
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

  startDate = new FormControl(moment().add(-6, 'M'));

  endDate = new FormControl(moment());

  income: Array<IncomeMonthly> = [];

  minDate: Date;

  maxDate: Date;

  constructor(private moneyTypeService: MoneyTypeService,
              private incomeItemsService: IncomeItemsService,
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

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 20, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);
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

  setStartMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    datepicker.close()
    this.setDate(normalizedMonthAndYear, this.startDate);
    this.loadData()
  }

  setEndMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    datepicker.close();
    this.setDate(normalizedMonthAndYear, this.endDate);
    this.loadData()
  }

  private setDate(normalizedMonthAndYear: moment.Moment, startDate: FormControl<any>) {
    const ctrlValue = startDate.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    startDate.setValue(ctrlValue);
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

  private createChart(moneyType: MoneyType) {

    let chart = {};

    // form unique X ticks
    let ticks: string[] = []
    let series: Map<string, IncomeMonthly[]> = new Map();

    return of(chart).pipe(
      switchMap(() => {
        return this.incomeItemsService.getIncomeInCurrency(this.currency,
          this.startDate.value!.month(), this.startDate.value!.year(),
          this.endDate.value!.month(), this.endDate.value!.year())
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
      title: {
        text: "Income in " + moneyType.name
      },
      tooltip: {
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        backgroundColor: 'rgba(206,206,206,0.7)',
        right: 10,
        top: 20,
        bottom: 20,
        padding: [25, 25, 25, 10],
        textStyle: {
          color: 'black',
          overflow: 'break',
          width: 150
        }
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

  minusSixMonths() {
    this.setDate(this.startDate.value!.add(-6, 'M'), this.startDate);
    this.setDate(this.endDate.value!.add(-6, 'M'), this.endDate);
    this.loadData()
  }

  plusSixMonths() {
    this.setDate(this.startDate.value!.add(6, 'M'), this.startDate);
    this.setDate(this.endDate.value!.add(6, 'M'), this.endDate);
    this.loadData()
  }
}
