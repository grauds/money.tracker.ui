import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subject, Subscription, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import {
  HateoasResourceService,
  PagedResourceCollection,
} from '@lagoshny/ngx-hateoas-client';

import {
  AccountsService,
  MoneyTypeService,
} from '@clematis-shared/shared-components';
import { MoneyType, MonthlyDelta } from '@clematis-shared/model';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.sass'],
  standalone: false,
})
export class BalanceComponent implements OnInit, OnDestroy {
  chart: any;

  // total number of elements
  total = 0;

  // number of records per page
  limit = 35;

  // current page number counter
  n: number | undefined = undefined;

  pageSubscription: Subscription;

  message = '';

  loading = false;

  currency: MoneyType;

  currencies: MoneyType[] = [];

  startDate = '';

  endDate = '';

  private destroy$ = new Subject<void>();

  constructor(
    private accountsService: AccountsService,
    private resourceService: HateoasResourceService,
    private moneyTypeService: MoneyTypeService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
  ) {
    this.currency = this.moneyTypeService.getSelectedMoneyType()
    this.pageSubscription = route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((queryParam: any) => {
        const page = Number.parseInt(queryParam['page'], 10);
        this.n = isNaN(page) ? undefined : page;
        const size = Number.parseInt(queryParam['size'], 10);
        this.limit = isNaN(size) ? 35 : size;
        this.loadData();
      });

    this.moneyTypeService.selectedMoneyType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currency = this.moneyTypeService.getSelectedMoneyType();
        this.loadData();
      });
  }

  ngOnInit(): void {
    this.title.setTitle('Balance Monthly');
    this.loadData();
  }

  setCurrentPage(pageIndex: number, pageSize?: number) {
    this.n = pageIndex;
    if (pageSize) {
      this.limit = pageSize;
    }
    return this.updateRoute();
  }

  updateRoute() {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.n,
        size: this.limit,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  loadData() {
    this.loading = true;
    this.getData(this.currency).subscribe((chart) => (this.chart = chart));
  }

  private getData(moneyType: MoneyType) {
    let xAxis: string[] = [];
    let yAxis: MonthlyDelta[] = [];

    return this.resourceService
      .searchPage<MonthlyDelta>(MonthlyDelta, 'history', {
        params: {
          code: moneyType.code,
        },
        pageParams: {
          page: 0,
          size: this.limit,
        },
      })
      .pipe(
        switchMap((response: PagedResourceCollection<MonthlyDelta>) => {
          this.limit = response.pageSize;
          this.total = response.totalElements;

          const totalPages = response.totalPages;
          const n =
            this.n !== undefined && this.n < totalPages
              ? this.n
              : totalPages - 1;

          return this.resourceService.searchPage<MonthlyDelta>(
            MonthlyDelta,
            'history',
            {
              params: {
                code: moneyType.code,
              },
              pageParams: {
                page: n,
                size: this.limit,
              },
            },
          );
        }),
        switchMap((response: PagedResourceCollection<MonthlyDelta>) => {
          this.n = response.pageNumber;
          return of(response.resources);
        }),
        switchMap((resources: MonthlyDelta[]) => {
          // filter out any other currencies
          yAxis = resources.filter(
            (value: MonthlyDelta) => value.code === moneyType.code,
          );

          // form unique ticks
          xAxis = resources
            .map((monthlyDelta: MonthlyDelta) => {
              return monthlyDelta.year + '/' + monthlyDelta.month;
            })
            .filter((value, index, self) => self.indexOf(value) === index);

          // the starting value for the graph fragment
          if (resources.length > 0) {
            return this.accountsService.getBalance(
              yAxis[0].year,
              yAxis[0].month,
              moneyType.code,
            );
          }

          return of(0);
        }),
        tap((balance: number) => console.log('Frame balance: ' + balance)),
        switchMap((balance: number) => {
          let currentBalance = balance || 0;
          const deltas: string[] = [];
          const totals: string[] = [];

          // https://github.com/apache/echarts/issues/11885
          xAxis.forEach((tick: string) => {
            const values = yAxis.filter(
              (delta) => delta.year + '/' + delta.month === tick,
            );

            if (values.length > 0) {
              const value = values[0];
              deltas.push(value.delta.toString());
              currentBalance += value.delta;
            } else {
              deltas.push('0');
            }
            totals.push(currentBalance.toString());
          });
          return of(this.buildChart(xAxis, deltas, totals, moneyType));
        }),
        catchError((err: Error) => {
          this.loading = false;
          throw err;
        }),
      );
  }

  private buildChart(
    waterfallX: string[],
    waterfallDelta: string[],
    waterfallTotals: string[],
    moneyType: MoneyType,
  ) {
    this.startDate = waterfallX[0];
    this.endDate = waterfallX[waterfallX.length - 1];
    this.loading = false;
    const title: string =
      'From ' +
      this.startDate +
      ' to ' +
      this.endDate +
      ', in ' +
      moneyType.code;

    return {
      title: {
        text: title,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: any) {
          if (params) {
            return params
              .map((param: any) => {
                return (
                  param.seriesName + ' : ' + Math.round(param.value * 100) / 100
                );
              })
              .join('<br/>');
          }
          return 'No params';
        },
      },
      legend: {
        data: ['Savings', 'Monthly Budget Outcome'],
        bottom: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: waterfallX,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Total',
          type: 'line',
          data: waterfallTotals,
        },
        {
          name: 'Monthly Balance',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: waterfallDelta,
        },
      ],
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
