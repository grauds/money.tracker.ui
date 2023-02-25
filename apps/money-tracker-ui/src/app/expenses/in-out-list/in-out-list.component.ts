import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { KeycloakService } from "keycloak-angular";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { HateoasResourceService, ResourceCollection } from "@lagoshny/ngx-hateoas-client";
import { InOutDelta, MoneyTypes } from "@clematis-shared/model";
import { InOutService } from "@clematis-shared/shared-components";
import { formatCurrency } from "@angular/common";
import { BreakpointObserver, Breakpoints, BreakpointState, MediaMatcher } from "@angular/cdk/layout";
import { map, shareReplay } from "rxjs/operators";
import { ECharts } from "echarts";

@Component({
  selector: 'app-in-out-list',
  templateUrl: './in-out-list.component.html',
  styleUrls: ['./in-out-list.component.sass'],
})
export class InOutListComponent implements OnInit {

  pageSubscription: Subscription;

  isLoggedIn: boolean = false;

  currency: MoneyTypes = MoneyTypes.RUB;

  currencies = [MoneyTypes.RUB,
    MoneyTypes.GBP,
    MoneyTypes.EUR,
    MoneyTypes.USD,
    MoneyTypes.CZK
  ];

  loading: boolean = false;

  total: number = 0;

  deltas: Array<InOutDelta> = [];

  options: any;

  sign = true;

  mobileQuery: MediaQueryList;

  private readonly _mobileQueryListener: () => void;

  isFullLayout$: Observable<boolean> = this.breakpointObserver.observe([
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
      Breakpoints.TabletLandscape,
      Breakpoints.WebLandscape
    ]
  )
    .pipe(
      map((result: BreakpointState) => result.matches),
      shareReplay()
    );

  showLegend = true;

  echartsInstance: ECharts | undefined;

  constructor(private inOutService: InOutService,
              private resourceService: HateoasResourceService,
              protected readonly keycloak: KeycloakService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title,
              media: MediaMatcher,
              private breakpointObserver: BreakpointObserver) {

    this.mobileQuery = media.matchMedia(Breakpoints.Handset);
    this._mobileQueryListener = () => {
      if (this.echartsInstance) {
        this.options = this.getDeltasChart(this.currency);
        this.echartsInstance.setOption(this.options)
      }
    }
    if (this.mobileQuery?.addEventListener) {
      this.mobileQuery.addEventListener("change", this._mobileQueryListener);
    } else {
      this.mobileQuery.addListener(this._mobileQueryListener);
    }

    this.keycloak.isLoggedIn().then((logged) => {
      this.isLoggedIn = logged
    })

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const currency: String = queryParam['currency']
        if (currency) {
          this.currency = MoneyTypes[currency as keyof typeof MoneyTypes]
        }
      }
    );

    this.isFullLayout$.subscribe((flag) => {
      this.showLegend = !flag
    })
  }

  ngOnInit(): void {
    this.loadData()
    this.title.setTitle('Reselling')
  }

  updateCurrency($event: MoneyTypes) {
    this.currency = $event
    this.loadData()
    this.updateRoute()
  }

  updateCategory($event: boolean) {
    this.sign = $event
    this.loadData()
  }

  updateRoute() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        currency: this.currency
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    })
  }

  loadData() {
    this.loading = true
    this.inOutService.getInOutDeltasInCurrency(this.currency)
      .subscribe((response: ResourceCollection<InOutDelta>) => {
        this.deltas = response.resources
        this.options = this.getDeltasChart(this.currency);
        this.total = this.deltas.reduce((accumulator, object) => {
          return accumulator + object.delta;
        }, 0);
        this.loading = false
      })
  }

  private getDeltasChart(code: MoneyTypes) {
    return {
      title: {
        text: 'Reselling results in ' + code,
        subtext: 'Total: ' + formatCurrency(this.deltas.filter((delta) => {
          return this.sign ? (delta.delta >= 0) : (delta.delta < 0)
        }).reduce(function(prev, current) {
          return prev + current.delta
        }, 0), navigator.language, 'RUB')
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
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
        },
        data: this.deltas.filter((delta) => {
          return this.sign ? (delta.delta >= 0) : (delta.delta < 0)
        }).map(delta => {
          return delta.commodity?.name
        })
      },
      series: [
        {
          name: code,
          type: 'pie',
          radius: [50, 250],
          center: ['40%', '50%'],
          data: this.deltas.filter((delta) => {
            return this.sign ? (delta.delta >= 0) : (delta.delta < 0)
          }).map((delta: InOutDelta) => {
            return {
              name: delta.commodity?.name,
              value: this.sign ? delta.delta : (-1) * delta.delta
            }
          }),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }

  onChartEvent($event: unknown, chartClick: string) {

  }

  onChartInit($event: any) {
    this.echartsInstance = $event;
  }
}
