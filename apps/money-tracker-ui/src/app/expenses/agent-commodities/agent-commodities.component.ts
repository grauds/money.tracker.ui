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

import {
  AgentCommodities,
  InfoAbout,
  MoneyType,
  Page,
} from '@clematis-shared/model';

import {
  ExpenseItemsService,
  MoneyTypeService,
  StatsService,
} from '@clematis-shared/shared-components';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;
import { formatDate } from '@angular/common';

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
  selector: 'app-agent-commodities',
  templateUrl: './agent-commodities.component.html',
  styleUrl: './agent-commodities.component.sass',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AgentCommoditiesComponent implements OnInit, OnDestroy {
  chart: any = {};

  headerLoading = false;

  loading = false;
  statsLoading = true;

  errorMessage: string | null = null;

  activeCurrencyCode = '';

  totalVisibleArea = 0;

  visibleSeriesTotals: VisibleAreaSummary[] = [];

  currency: MoneyType = new MoneyType();

  startDate = moment().add(-24, 'M');

  endDate = moment().add(1, 'M');

  showGroups = true;

  infoAbout: InfoAbout | undefined;

  private chartInstance: any = null;
  private currentChartSeries: {
    name: string;
    color: string;
    data: number[];
  }[] = [];
  private selectedSeries: Record<string, boolean> = {};
  private hoveredSeriesName: string | null = null;

  private startDate$ = new BehaviorSubject<moment.Moment>(
    moment().add(-24, 'M'),
  );
  private endDate$ = new BehaviorSubject<moment.Moment>(moment().add(1, 'M'));
  private destroy$ = new Subject<void>();
  private showGroups$ = new BehaviorSubject<boolean>(true);

  constructor(
    protected moneyTypeService: MoneyTypeService,
    private readonly expenseItemsService: ExpenseItemsService,
    private readonly statsService: StatsService,
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
    this.title.setTitle('Expenses Groups Trends');
    this.loadStats();
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
          return of<{ items: AgentCommodities[]; currencyCode: string } | null>(
            null,
          );
        }

        return this.expenseItemsService
          .getAgentExpencesInCurrency(
            currency,
            start.month() + 1, // Convert Moment's 0-11 to Firebird's 1-12
            start.year(),
            end.month() + 1, // Convert Moment's 0-11 to Firebird's 1-12
            end.year(),
          )
          .pipe(
            map((response: Page<AgentCommodities>) => ({
              items: response.content ?? [],
              currencyCode: currency.code,
            })),
            tap(() => (this.loading = false)),
            catchError((error) => {
              console.error('Failed to load chart data:', error);
              this.errorMessage =
                'Could not load expense data. Please try again.';
              this.loading = false;
              return of(null);
            }),
          );
      }),
      takeUntil(this.destroy$),
    );

    // Rebuild chart & summary table in memory whenever data OR showGroups changes
    combineLatest([data$, this.showGroups$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([result, showGroups]) => {
        this.showGroups = showGroups;
        if (result) {
          this.activeCurrencyCode = result.currencyCode;
          this.chart = this.createChartFromData(
            result.items,
            showGroups,
            result.currencyCode,
          );
        }
      });
  }

  updateStartDate(normalizedMonthAndYear: moment.Moment) {
    this.startDate$.next(normalizedMonthAndYear);
  }

  updateEndDate(normalizedMonthAndYear: moment.Moment) {
    this.endDate$.next(normalizedMonthAndYear);
  }

  onFilterEvent(data: boolean) {
    this.showGroups$.next(data);
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

  private createChartFromData(
    items: AgentCommodities[],
    showGroups: boolean,
    currencyCode: string,
  ): any {
    const series: Map<string, AgentCommodities[]> = new Map();

    items.forEach((month: AgentCommodities) => {
      if (month.agent && month.commodityGroup) {
        const key =
          month.agent + (showGroups ? ': ' + month.commodityGroup : '');
        const values = series.get(key) ?? [];

        if (showGroups) {
          values.push(month);
        } else {
          const existing = values.find(
            (v) =>
              v.agent === month.agent &&
              v.an === month.an &&
              v.mois === month.mois,
          );
          if (existing) {
            existing.total = Number((existing.total + month.total).toFixed(4));
          } else {
            values.push({ ...month });
          }
        }
        series.set(key, values);
      }
    });

    const ticks = Array.from(
      new Set(items.map((month) => `${month.an}/${month.mois}`)),
    );

    return this.buildChart(ticks, series);
  }

  private getChartsSeries(
    ticks: string[],
    series: Map<string, AgentCommodities[]>,
  ): any[] {
    const chartSeries: any[] = [];
    let colorIndex = 0;

    series.forEach(
      (commoditiesMonthly: AgentCommodities[], name: string) => {
      const color = CHART_PALETTE[colorIndex % CHART_PALETTE.length];
      colorIndex++;

      chartSeries.push({
        name: name,
        type: 'line',
        stack: 'total',
        color: color,
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

  private buildChart(
    ticks: string[],
    series: Map<string, AgentCommodities[]>
  ) {
    const builtSeries = this.getChartsSeries(ticks, series);
    this.currentChartSeries = builtSeries;

    this.selectedSeries = {};
    builtSeries.forEach((s) => {
      this.selectedSeries[s.name] = true;
    });

    this.recalculateVisibleTotals();

    return {
      color: CHART_PALETTE,
      legend: {
        backgroundColor: 'rgba(206,206,206,0.7)',
        type: 'scroll',
        right: 10,
        top: 20,
        bottom: 20,
        data: [...series.keys()].sort(),
        selected: this.selectedSeries,
      },
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
        confine: false,
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

  private loadStats() {
    this.headerLoading = true;
    this.statsService
      .getInfoAbout()
      .pipe(
        catchError((error) => {
          console.error('Failed to load stats info:', error);
          return of(undefined);
        }),
        finalize(() => (this.headerLoading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe((infoAbout) => {
        this.infoAbout = infoAbout;
        this.statsLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
