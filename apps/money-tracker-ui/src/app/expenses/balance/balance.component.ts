import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  finalize,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { ResourceCollection } from '@lagoshny/ngx-hateoas-client';

import {
  MonthlyBalanceSummary,
  MoneyType
} from '@clematis-shared/model';

import {
  AccountsService,
  MoneyTypeService,
} from '@clematis-shared/shared-components';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;


import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

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

const CHART_PALETTE = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
];

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.sass'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class BalanceComponent implements OnInit, OnDestroy {
  chart: any = {};

  loading = false;

  errorMessage: string | null = null;

  activeCurrencyCode = '';

  currency: MoneyType = new MoneyType();

  startDate = moment().add(-24, 'M');

  endDate = moment().add(1, 'M');

  private rawItems: MonthlyBalanceSummary[] = [];

  private chartInstance: any = null;

  private startDate$ = new BehaviorSubject<moment.Moment>(
    moment().add(-24, 'M'),
  );
  private endDate$ = new BehaviorSubject<moment.Moment>(moment().add(1, 'M'));
  private destroy$ = new Subject<void>();

  constructor(
    private readonly moneyTypeService: MoneyTypeService,
    private readonly accountsService: AccountsService,
    private readonly title: Title,
  ) {}

  get selectedCurrencyCode(): string {
    return (
      this.activeCurrencyCode ||
      this.currency?.code ||
      this.moneyTypeService.getSelectedMoneyType()?.code ||
      ''
    );
  }

  ngOnInit(): void {
    this.title.setTitle('Balance Monthly');
    this.listenToFilterChanges();
  }

  onChartInit(ec: any): void {
    this.chartInstance = ec;
  }

  private getCurrencyStream(): Observable<MoneyType> {
    return this.moneyTypeService.selectedMoneyType$.pipe(
      startWith(null),
      map(() => this.moneyTypeService.getSelectedMoneyType()),
      distinctUntilChanged((prev, curr) => prev?.code === curr?.code),
    );
  }

  private listenToFilterChanges() {
    // Fetch converted data whenever startDate, endDate, OR global currency changes
    const data$ = combineLatest([
      this.startDate$,
      this.endDate$,
      this.getCurrencyStream(),
    ]).pipe(
      tap(([, , currency]) => {
        this.currency = currency;
        this.loading = true;
        this.errorMessage = null;
      }),
      switchMap(([start, end, currency]) => {
        if (!currency) {
          this.loading = false;
          return of<{
            items: MonthlyBalanceSummary[];
            currencyCode: string;
          } | null>(null);
        }

        return this.accountsService
          .getBalanceSummaryInCurrency(
            currency,
            start.month() + 1, // Convert Moment's 0-11 to Firebird's 1-12
            start.year(),
            end.month() + 1, // Convert Moment's 0-11 to Firebird's 1-12
            end.year(),
          )
          .pipe(
            map((response: ResourceCollection<MonthlyBalanceSummary>) => ({
              items: response.resources ?? [],
              currencyCode: currency.code,
            })),
            tap(() => (this.loading = false)),
            catchError((error) => {
              console.error('Failed to load balance chart data:', error);
              this.errorMessage =
                'Could not load balance data. Please try again.';
              this.loading = false;
              return of(null);
            }),
          );
      }),
      takeUntil(this.destroy$),
    );

    // Rebuild chart & summary table in memory whenever data OR showGroups changes
    data$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.activeCurrencyCode = result.currencyCode;
          this.rawItems = result.items;
          this.chart = this.createChartFromData(result.items);
        }
      });
  }

  updateStartDate(normalizedMonthAndYear: moment.Moment) {
    this.startDate$.next(normalizedMonthAndYear);
  }

  updateEndDate(normalizedMonthAndYear: moment.Moment) {
    this.endDate$.next(normalizedMonthAndYear);
  }

  private createChartFromData(
    items: MonthlyBalanceSummary[]
  ): any {
    const series: Map<string, MonthlyBalanceSummary[]> = new Map();

    items.forEach((row: MonthlyBalanceSummary) => {
      if (row.accountName) {
        const values = series.get(row.accountName) ?? [];
        values.push(row);
        series.set(row.accountName, values);
      }
    });

    const ticks = Array.from(
      new Set(items.map((item: MonthlyBalanceSummary) => `${item.year}/${item.month}`)),
    );

    return this.buildChart(ticks, series);
  }

  private getChartsSeries(
    ticks: string[],
    series: Map<string, MonthlyBalanceSummary[]>,
  ): any[] {
    const chartSeries: any[] = [];
    let colorIndex = 0;

    series.forEach(
      (accountMonthly: MonthlyBalanceSummary[], accountName: string) => {
        const color = CHART_PALETTE[colorIndex % CHART_PALETTE.length];
        colorIndex++;

        chartSeries.push({
          name: accountName,
          type: 'bar',
          stack: 'total',
          color: color,
          emphasis: {
            focus: 'series',
            label: {
              show: true,
            },
          },
          data: ticks.map((tick) => {
            const found = accountMonthly.find(
              (value) => `${value.year}/${value.month}` === tick,
            );
            return found?.balanceTarget ?? 0;
          }),
        });
    });

    return chartSeries;
  }

  private buildChart(
    ticks: string[],
    series: Map<string, MonthlyBalanceSummary[]>,
  ) {
    const builtSeries = this.getChartsSeries(ticks, series);
    const itemsSnapshot = this.rawItems;
    const targetCurrency = this.selectedCurrencyCode;

    return {
      color: CHART_PALETTE,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        position: function (
          pos: number[],
          _params: any,
          _el: any,
          _elRect: any,
          size: { viewSize: number[] },
        ) {
          const obj: any = { top: 10 };
          obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          return obj;
        },
        formatter: function (params: any[]) {
          if (!params || params.length === 0) {
            return '';
          }

          const tick = params[0].axisValueLabel;
          const activeParams = params.filter((p) => p.value !== 0);
          const monthTotal = activeParams.reduce(
            (sum, p) => sum + (Number(p.value) || 0),
            0,
          );

          const formatNum = (val: number) =>
            val.toLocaleString('ru-RU', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

          let output = `<div style="margin-bottom: 6px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">
            <strong>${tick}</strong> — Total: <strong>${formatNum(monthTotal)} ${targetCurrency}</strong>
          </div>`;

          output += '<table style="width: 100%; border-collapse: collapse;">';

          const sorted = [...activeParams].sort((a, b) => b.value - a.value);

          sorted.forEach((param) => {
            const valTarget = Number(param.value) || 0;
            const pct = monthTotal !== 0 ? (valTarget / monthTotal) * 100 : 0;

            const record = itemsSnapshot.find(
              (item) =>
                `${item.year}/${item.month}` === tick &&
                item.accountName === param.seriesName,
            );

            const origPart =
              record && record.code
                ? `${formatNum(record.balanceOrig)} ${record.code}`
                : '';

            output += `<tr>
              <td style="padding: 2px 6px 2px 0;">${param.marker}</td>
              <td style="padding: 2px 12px 2px 0;">${param.seriesName}</td>
              <td style="padding: 2px 12px 2px 0; text-align: right; color: #555;">${origPart}</td>
              <td style="padding: 2px 8px 2px 0; text-align: right; font-weight: bold;">${formatNum(valTarget)} ${targetCurrency}</td>
              <td style="padding: 2px 0; text-align: right; color: #666;">(${pct.toFixed(1)}%)</td>
            </tr>`;
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
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ticks,
      },
      yAxis: {
        type: 'value',
      },
      series: builtSeries,
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
