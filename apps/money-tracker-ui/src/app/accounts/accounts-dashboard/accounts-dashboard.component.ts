import {Component, OnInit} from '@angular/core';
import {MoneyTrackerService} from '@clematis-shared/money-tracker-service';
import {AccountBalance, MoneyTypes} from '@clematis-shared/model';
import {Subscription} from "rxjs";
import {HateoasResourceService} from "@lagoshny/ngx-hateoas-client";
import {KeycloakService} from 'keycloak-angular';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-accounts-dashboard',
  templateUrl: './accounts-dashboard.component.html',
  styleUrls: ['./accounts-dashboard.component.css'],
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
    MoneyTypes.USD
  ];

  constructor(private moneyTrackerService: MoneyTrackerService,
              private resourceService: HateoasResourceService,
              protected readonly keycloak: KeycloakService,
              private router: Router,
              private route: ActivatedRoute) {

    this.keycloak.isLoggedIn().then((logged) => {
      this.isLoggedIn = logged
    })

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const currency: String = queryParam['currency']
        if (currency) {
          this.currency = MoneyTypes[currency as keyof typeof MoneyTypes]
        }
        this.ngOnInit();
      }
    );
  }

  ngOnInit(): void {
    this.loadData()
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
    this.moneyTrackerService.getAccountsBalance((response) => {

      this.accountsBalances = response.resources
      this.options = this.getBalancesChart(this.currency);
      this.loading = false

    }, (error) => {
      this.loading = false
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
          .filter(accountBalance => accountBalance.balance != 0 && accountBalance.code === code)
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
          data: this.accountsBalances
            .filter(accountBalance => accountBalance.balance != 0 && accountBalance.code === code)
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
