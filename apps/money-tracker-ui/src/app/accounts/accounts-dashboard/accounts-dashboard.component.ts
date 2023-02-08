import { Component, OnInit } from '@angular/core';
import { AccountBalance, MoneyTypes } from '@clematis-shared/model';
import { Subscription } from "rxjs";
import { HateoasResourceService, ResourceCollection } from "@lagoshny/ngx-hateoas-client";
import { KeycloakService } from 'keycloak-angular';
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { AccountsService } from "@clematis-shared/shared-components";

@Component({
  selector: 'app-accounts-dashboard',
  templateUrl: './accounts-dashboard.component.html',
  styleUrls: ['./accounts-dashboard.component.sass'],
})
export class AccountsDashboardComponent implements OnInit {

  isLoggedIn?: boolean;

  accountsBalances: AccountBalance[] = []

  options: any;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  loading = false;

  currency: MoneyTypes = MoneyTypes.RUB;

  currencies = [MoneyTypes.RUB,
    MoneyTypes.GBP,
    MoneyTypes.EUR,
    MoneyTypes.USD,
    MoneyTypes.CZK
  ];

  total: number = 0;

  constructor(private accountsService: AccountsService,
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

  onChartEvent(event: any, type: string) {
    console.log('chart event:', type, event);
  }

  ngOnInit(): void {
    this.loadData()
    this.title.setTitle('Accounts')
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
    this.accountsService.getAccountsBalanceInCurrency(this.currency)
      .subscribe((response: ResourceCollection<AccountBalance>) => {
            this.accountsBalances = response.resources
            this.options = this.getBalancesChart(this.currency);
            this.accountsService.getAccountsTotalInCurrency(this.currency).subscribe(
              (total: number) => {
                this.total = total
                this.loading = false
                return this.accountsBalances
              }
            )
          })
  }

  private getBalancesChart(code: MoneyTypes) {
    return {
      title: {
        text: 'Accounts Today in ' + code
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
        data: this.accountsBalances
          .filter(accountBalance => accountBalance.balance != 0)
          .map(accountBalance => {
            return accountBalance.name
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
          data: this.accountsBalances
            .filter(accountBalance => accountBalance.balance != 0)
            .map((accountBalance: AccountBalance) => {
              return {
                value: accountBalance.balance
              }
            })
        }
      ]
    };
  }
}
