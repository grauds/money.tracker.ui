import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { KeycloakService } from 'keycloak-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import {
  PagedResourceCollection,
  ResourceCollection,
} from '@lagoshny/ngx-hateoas-client';

import { formatCurrency } from '@angular/common';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
  MediaMatcher,
} from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { ECharts } from 'echarts';

import { InOutDelta, MoneyType } from '@clematis-shared/model';
import {
  InOutService,
  MoneyTypeService,
} from '@clematis-shared/shared-components';

@Component({
  selector: 'app-in-out-list',
  templateUrl: './in-out-list.component.html',
  styleUrls: ['./in-out-list.component.sass'],
  standalone: false,
})
export class InOutListComponent implements OnInit {
  pageSubscription: Subscription;

  isLoggedIn = false;

  currency: MoneyType = new MoneyType();

  currencies: MoneyType[] = [];

  loading = false;

  total = 0;

  deltas: Array<InOutDelta> = [];

  options: any;

  sign = false;

  mobileQuery: MediaQueryList;

  private readonly _mobileQueryListener: () => void;

  isFullLayout$: Observable<boolean> = this.breakpointObserver
    .observe([
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
      Breakpoints.TabletLandscape,
      Breakpoints.WebLandscape,
    ])
    .pipe(
      map((result: BreakpointState) => result.matches),
      shareReplay()
    );

  showLegend = true;

  echartsInstance: ECharts | undefined;

  constructor(
    private inOutService: InOutService,
    protected readonly keycloak: KeycloakService,
    private moneyTypeService: MoneyTypeService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    media: MediaMatcher,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isLoggedIn = this.keycloak.isLoggedIn();

    this.mobileQuery = media.matchMedia(Breakpoints.Handset);
    this._mobileQueryListener = () => {
      if (this.echartsInstance) {
        this.options = this.getDeltasChart(this.currency);
        this.echartsInstance.setOption(this.options);
      }
    };

    if (this.mobileQuery?.addEventListener) {
      this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    } else {
      this.mobileQuery.addListener(this._mobileQueryListener);
    }

    this.pageSubscription = route.queryParams.subscribe((queryParam: any) => {
      const currency: string = queryParam['currency'];
      this.moneyTypeService
        .getCurrencyByCode(currency || 'RUB')
        .subscribe((result: MoneyType) => {
          this.currency = result;
          this.loadData();
        });
    });

    this.isFullLayout$.subscribe((flag) => {
      this.showLegend = !flag;
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Reselling');
  }

  updateCurrency($event: MoneyType) {
    this.currency = $event;
    this.loadData();
    this.updateRoute();
  }

  updateCategory($event: boolean) {
    this.sign = $event;
    this.loadData();
  }

  updateRoute() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        currency: this.currency.code,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  loadData() {
    this.loading = true;

    this.moneyTypeService
      .getPage({
        pageParams: {
          page: 0,
          size: 200,
        },
      })
      .subscribe({
        next: (response: PagedResourceCollection<MoneyType>) => {
          this.currencies = response.resources;
          this.getInOutDeltasInCurrency();
        },
        error: () => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private getInOutDeltasInCurrency() {
    this.inOutService.getInOutDeltasInCurrency(this.currency).subscribe({
      next: (response: ResourceCollection<InOutDelta>) => {
        this.deltas = response.resources;
        this.total = this.deltas.reduce((accumulator, object) => {
          return accumulator + object.delta;
        }, 0);
        if (this.deltas && this.deltas.length > 0) {
          this.options = this.getDeltasChart(this.currency);
        }
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private getDeltasChart(moneyType: MoneyType) {
    return {
      title: {
        text: 'Reselling results in ' + moneyType.code,
        subtext:
          'Total: ' +
          formatCurrency(
            this.deltas
              .filter((delta) => {
                return this.sign ? delta.delta >= 0 : delta.delta < 0;
              })
              .reduce(function (prev, current) {
                return prev + current.delta;
              }, 0),
            navigator.language,
            this.currency.code
          ),
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
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
          width: 150,
        },
        data: this.deltas
          .filter((delta) => {
            return this.sign ? delta.delta >= 0 : delta.delta < 0;
          })
          .map((delta) => {
            return delta.commodity?.name;
          }),
      },
      series: [
        {
          name: moneyType.name,
          type: 'pie',
          radius: [50, 250],
          center: ['40%', '50%'],
          data: this.deltas
            .filter((delta) => {
              return this.sign ? delta.delta >= 0 : delta.delta < 0;
            })
            .map((delta: InOutDelta) => {
              return {
                name: delta.commodity?.name,
                value: this.sign ? delta.delta : -1 * delta.delta,
              };
            }),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }

  onChartInit($event: any) {
    this.echartsInstance = $event;
  }
}
