import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { KeycloakService } from "keycloak-angular";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { HateoasResourceService, ResourceCollection } from "@lagoshny/ngx-hateoas-client";
import { InOutDelta, MoneyTypes } from "@clematis-shared/model";
import { InOutService } from "@clematis-shared/shared-components";

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

  constructor(private inOutService: InOutService,
              private resourceService: HateoasResourceService,
              protected readonly keycloak: KeycloakService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title) {

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
        text: 'Reselling results in ' + code
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        top: 80,
        bottom: 30
      },
      xAxis: {
        type: 'value',
        position: 'top',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'category',
        axisLine: {show: false},
        axisLabel: {show: false},
        axisTick: {show: true},
        splitLine: {show: false},
        data: this.deltas.map(delta => {
            return delta.commodity?.name
          })
      },
      series: [
        {
          name: code,
          type: 'bar',
          stack: 'Total',
          label: {
            position: 'right',
            show: true,
            formatter: '{c} - {b}'
          },
          select: {
            itemStyle: {
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              shadowBlur: 10
            }
          },
          selectedMode: 'single',
          data: this.deltas
            .map((delta: InOutDelta) => {
              return {
                value: delta.delta
              }
            })
        }
      ]
    };
  }

  onChartEvent($event: unknown, chartClick: string) {

  }
}
