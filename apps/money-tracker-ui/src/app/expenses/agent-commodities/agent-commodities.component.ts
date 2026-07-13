import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';

import { AgentCommodities, InfoAbout, MoneyType, Page } from '@clematis-shared/model';
import {
  ExpenseItemsService, MoneyTypeService,
  StatsService
} from '@clematis-shared/shared-components';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { formatDate } from '@angular/common';

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
  standalone: false,
})
export class AgentCommoditiesComponent implements OnInit {
  chart: any;

  statsLoading = false;

  loading = false;

  startDate = moment().add(-6, 'M');

  endDate = moment().add(1, 'M');

  showGroups = true;

  showGroupsEvent = new BehaviorSubject<boolean>(true);

  checkSubscription = this.showGroupsEvent.asObservable();

  infoAbout: InfoAbout | undefined;

  constructor(
    protected moneyTypeService: MoneyTypeService,
    private readonly expenseItemsService: ExpenseItemsService,
    private readonly statsService: StatsService,
    private readonly title: Title,
  ) {
    this.checkSubscription.subscribe(() => {
      this.loading = true;
      this.createChart(this.moneyTypeService.getSelectedMoneyType()).subscribe(
        (chart) => {
          this.chart = chart;
          this.loading = false;
        },
      );
    });
  }

  onFilterEvent(data: boolean) {
    this.showGroupsEvent.next(data);
  }

  ngOnInit(): void {
    this.title.setTitle('Users Commodities');
    this.statsLoading = true;
    this.statsService
      .getInfoAbout()
      .subscribe((infoAbout) => {
        this.infoAbout = infoAbout;
        this.statsLoading = false;
      });
    this.loadData();
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

  loadData() {
    this.loading = true;

    this.createChart(this.moneyTypeService.getSelectedMoneyType()).subscribe(
      (chart) => {
        this.chart = chart;
        this.loading = false;
      },
    );
  }

  getStartDate() {
    if (this.infoAbout && this.infoAbout.dates && this.infoAbout.dates.start) {
      return formatDate(this.infoAbout.dates.start, 'mediumDate', 'en_US');
    } else {
      return 'No date';
    }
  }

  getLastDate() {
    if (this.infoAbout && this.infoAbout.dates && this.infoAbout.dates.end) {
      return formatDate(this.infoAbout.dates.end, 'mediumDate', 'en_US');
    } else {
      return 'No date';
    }
  }

  private createChart(currency: MoneyType): Observable<any> {
    const chart = {};

    let ticks: string[] = [];
    const series: Map<string, AgentCommodities[]> = new Map();

    return currency
      ? of(chart).pipe(
          switchMap(() => {
            return this.expenseItemsService.getAgentExpencesInCurrency(
              currency,
              this.startDate.month(),
              this.startDate.year(),
              this.endDate.month(),
              this.endDate.year(),
            );
          }),
          switchMap((response: Page<AgentCommodities>) => {
            return of(response.content);
          }),
          switchMap((response: AgentCommodities[]) => {
            // form series of data in the interval
            response.forEach((month: AgentCommodities) => {
              if (month.agent && month.commodityGroup) {
                const key =
                  month.agent +
                  (this.showGroups ? ': ' + month.commodityGroup : '');
                let values: AgentCommodities[] = [];
                if (series.get(key)) {
                  values = series.get(key)!;
                }
                if (this.showGroups) {
                  values.push(month);
                } else {
                  let found = false;
                  for (const i in values) {
                    if (
                      values[i].agent == month.agent &&
                      values[i].an == month.an &&
                      values[i].mois == month.mois
                    ) {
                      values[i].total += month.total;
                      values[i].total = Number(values[i].total.toFixed(4));
                      found = true;
                      break;
                    }
                  }
                  if (!found) {
                    values.push(month);
                  }
                }
                series.set(key, values);
              }
            });

            // form unique ticks
            ticks = response
              .map((month: AgentCommodities) => {
                return month.an + '/' + month.mois;
              })
              .filter((value, index, self) => self.indexOf(value) === index);

            return of(0);
          }),
          switchMap(() => {
            return of(this.buildChart(ticks, series));
          }),
        )
      : of(chart);
  }

  private getChartsSeries(
    ticks: string[],
    series: Map<string, AgentCommodities[]>,
  ): any[] {
    const chartSeries: any[] = [];

    series.forEach((commoditiesMonthly: AgentCommodities[], name: string) => {
      return chartSeries.push({
        name: name,
        type: 'line',
        stack: 'total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
          label: {
            show: true,
          },
        },
        data: ticks.map((tick) => {
          const ac: AgentCommodities | undefined = commoditiesMonthly.find(
            (value: AgentCommodities) => {
              return value.an + '/' + value.mois === tick;
            },
          );
          return ac ? ac.total : 0;
        }),
      });
    });

    return chartSeries;
  }

  private buildChart(ticks: string[], series: Map<string, AgentCommodities[]>) {
    return {
      legend: {
        backgroundColor: 'rgba(206,206,206,0.7)',
        type: 'scroll',
        right: 10,
        top: 20,
        bottom: 20,
        data: (function () {
          return [...series.keys()].sort();
        })(),
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        position: function (
          pos: number[],
          params: any,
          el: any,
          elRect: any,
          size: { viewSize: number[] },
        ) {
          const obj: any = { top: 10 };
          obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          return obj;
        },
        confine: false,
        formatter: function (params: any[]) {
          let output = params[0].axisValueLabel + '<br/>';
          output += '<table class="w-full">';

          const sorted: any[] = params.sort(
            (paramA, paramB) => paramB.value - paramA.value,
          );
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
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: ticks,
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: this.getChartsSeries(ticks, series),
    };
  }
}
