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
  IncomeMonthly,
  MoneyType,
} from '@clematis-shared/model';

import {
  IncomeItemsService,
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

export interface VisibleAreaSummary {
  name: string;
  color: string;
  total: number;
  percentage: number;
}

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
  selector: 'app-income-monthly',
  templateUrl: './income-monthly.component.html',
  styleUrls: ['./income-monthly.component.sass'],
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
export class IncomeMonthlyComponent implements OnInit, OnDestroy {
  chart: any = {};

  loading = false;

  errorMessage: string | null = null;

  activeCurrencyCode = '';

  totalVisibleArea = 0;
  visibleSeriesTotals: VisibleAreaSummary[] = [];
  private currentChartSeries: {
    name: string;
    color: string;
    data: number[];
  }[] = [];
  private selectedSeries: Record<string, boolean> = {};
  private hoveredSeriesName: string | null = null;

  currency: MoneyType = new MoneyType();

  startDate = moment().add(-24, 'M');

  endDate = moment().add(1, 'M');

  income: Array<IncomeMonthly> = [];

  private chartInstance: any = null;

  private startDate$ = new BehaviorSubject<moment.Moment>(
    moment().add(-24, 'M'),
  );
  private endDate$ = new BehaviorSubject<moment.Moment>(moment().add(1, 'M'));
  private destroy$ = new Subject<void>();

  constructor(
    private readonly moneyTypeService: MoneyTypeService,
    private readonly incomeItemsService: IncomeItemsService,
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
    this.title.setTitle('Income');
    this.listenToFilterChanges();
  }

  onChartInit(ec: any): void {
    this.chartInstance = ec;

    this.chartInstance.on('legendselectchanged', (params: any) => {
      this.selectedSeries = params.selected || {};
      this.recalculateVisibleTotals();
    });
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
          return of<{ items: IncomeMonthly[]; currencyCode: string } | null>(
            null,
          );
        }

        return this.incomeItemsService
          .getIncomeInCurrency(
            currency,
            start.month() + 1, // Convert Moment's 0-11 to Firebird's 1-12
            start.year(),
            end.month() + 1, // Convert Moment's 0-11 to Firebird's 1-12
            end.year(),
          )
          .pipe(
            map((response: ResourceCollection<IncomeMonthly>) => ({
              items: response.resources ?? [],
              currencyCode: currency.code,
            })),
            tap(() => (this.loading = false)),
            catchError((error) => {
              console.error('Failed to load chart data:', error);
              this.errorMessage =
                'Could not load income data. Please try again.';
              this.loading = false;
              return of(null);
            }),
          );
      }),
      takeUntil(this.destroy$),
    );

    // Rebuild chart & summary table in memory whenever data OR showGroups changes
    combineLatest([data$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([result]) => {
        if (result) {
          this.activeCurrencyCode = result.currencyCode;
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
    items: IncomeMonthly[]
  ): any {
    const series: Map<string, IncomeMonthly[]> = new Map();

    items.forEach((incomeMonthly: IncomeMonthly) => {
      if (incomeMonthly.name) {
        const values: IncomeMonthly[] = series.get(incomeMonthly.name) ?? [];
        values.push(incomeMonthly);
        series.set(incomeMonthly.name, values);
      }
    });

    const ticks = Array.from(
      new Set(items.map((item: IncomeMonthly) => `${item.year}/${item.month}`)),
    );

    return this.buildChart(ticks, series);
  }

  private getChartsSeries(
    ticks: string[],
    series: Map<string, IncomeMonthly[]>,
  ): any[] {
    const chartSeries: any[] = [];
    let colorIndex = 0;

    series.forEach(
      (incomeMonthly: IncomeMonthly[], name: string) => {
        const color = CHART_PALETTE[colorIndex % CHART_PALETTE.length];
        colorIndex++;

        chartSeries.push({
          name: name,
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
            const found = incomeMonthly.find(
              (value: IncomeMonthly) => `${value.year}/${value.month}` === tick,
            );
            return found?.totalConverted ?? 0;
          }),
        });
    });

    return chartSeries;
  }

  private recalculateVisibleTotals(): void {
    let grandTotal = 0;
    const rawVisible: { name: string; color: string; total: number }[] = [];

    for (const s of this.currentChartSeries) {
      const isVisible = this.selectedSeries[s.name];
      if (isVisible) {
        const seriesSum = s.data.reduce((acc, val) => acc + (val || 0), 0);
        grandTotal += seriesSum;
        rawVisible.push({
          name: s.name,
          color: s.color,
          total: Number(seriesSum.toFixed(2)),
        });
      }
    }

    this.totalVisibleArea = Number(grandTotal.toFixed(2));
    this.visibleSeriesTotals = rawVisible
      .map((item) => ({
        ...item,
        percentage: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  private buildChart(ticks: string[], series: Map<string, IncomeMonthly[]>) {
    const builtSeries = this.getChartsSeries(ticks, series);
    this.currentChartSeries = builtSeries;

    this.selectedSeries = {};
    builtSeries.forEach((s) => {
      this.selectedSeries[s.name] = true;
    });

    this.recalculateVisibleTotals();

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

          let output = params[0].axisValueLabel + '';
          output += '<table class="w-full">';
          const sorted: any[] = [...params].sort(
            (paramA, paramB) => paramB.value - paramA.value,
          );
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

  onSeriesHover(seriesName: string | null): void {
    if (!this.chartInstance || this.hoveredSeriesName === seriesName) {
      return;
    }

    if (this.hoveredSeriesName) {
      this.chartInstance.dispatchAction({
        type: 'downplay',
        seriesName: this.hoveredSeriesName,
      });
    }

    this.hoveredSeriesName = seriesName;

    if (seriesName) {
      this.chartInstance.dispatchAction({
        type: 'highlight',
        seriesName,
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
