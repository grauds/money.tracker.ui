import { Component, OnInit } from '@angular/core';
import { AccountBalance } from '@clematis-shared/model';
import { MoneyTrackerService } from '@clematis-shared/money-tracker-service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-accounts-dashboard',
  templateUrl: './accounts-dashboard.component.html',
  styleUrls: ['./accounts-dashboard.component.css'],
})
export class AccountsDashboardComponent implements OnInit {

  isLoggedIn?: boolean;

  accountsBalances: AccountBalance[] = []

  optionsRub: any;
  optionsEur: any;
  optionsUsd: any;

  error: Error | undefined;

  constructor(private moneyTrackerService: MoneyTrackerService,
              protected readonly keycloak: KeycloakService) {
    this.keycloak.isLoggedIn().then((logged) => {
      this.isLoggedIn = logged
    })
  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData() {

    this.moneyTrackerService.getAccountsBalance((response) => {

      this.accountsBalances = response.resources

      this.optionsRub = this.getBalancesChart('Roubles', 'RUB');
      this.optionsUsd = this.getBalancesChart('Dollars', 'USD');
      this.optionsEur = this.getBalancesChart('Euros', 'EUR');

    }, (error) => {
      this.error = error
    })
  }

  private getBalancesChart(name: string, code: string) {
    return {
      title: {
        text: 'Accounts Today in ' + name
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
          name: name,
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
