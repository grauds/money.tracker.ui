import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountBalance, MoneyType } from '@clematis-shared/model';
import { Subject } from 'rxjs';
import {
  ResourceCollection,
} from '@lagoshny/ngx-hateoas-client';
import { Title } from '@angular/platform-browser';
import {
  AccountsService,
  MoneyTypeService,
} from '@clematis-shared/shared-components';

@Component({
  selector: 'app-accounts-dashboard',
  templateUrl: './accounts-dashboard.component.html',
  styleUrls: ['./accounts-dashboard.component.sass'],
  providers: [{ provide: 'searchService', useClass: AccountsService }],
  standalone: false,
})
export class AccountsDashboardComponent implements OnInit, OnDestroy {
  // total sum in the chosen currency
  total = 0;

  // total sum week ago in the chosen currency
  totalWeekAgo = 0;

  accounts: AccountBalance[] = [];

  loading = false;

  totalsLoading = false;

  totalsHistoryLoading = false;

  currency: MoneyType;

  currencies: MoneyType[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private readonly accountsService: AccountsService,
    private readonly moneyTypeService: MoneyTypeService,
    private readonly title: Title,
  ) {
    this.currency = this.moneyTypeService.getSelectedMoneyType();
    this.currencies = this.moneyTypeService.getLoadedMoneyTypes();
  }

  ngOnInit(): void {
    this.title.setTitle('Accounts');
    this.getAccountsTotalInCurrency();
    this.getAccountsInCurrency();
  }

  private getAccountsTotalInCurrency() {
    this.totalsLoading = true;
    this.accountsService.getAccountsTotalInCurrency(this.currency).subscribe({
      next: (total: number) => {
        this.total = total;
      },
      error: () => {
        this.total = 0;
      },
      complete: () => {
        this.totalsLoading = false;
      },
    });
  }

  private getAccountsTotalWeekAgoInCurrency() {
    this.totalsHistoryLoading = true;
    this.accountsService
      .getAccountsTotalHistoryInCurrency(this.currency, 7)
      .subscribe({
        next: (total: number) => {
          this.totalWeekAgo = total;
        },
        error: () => {
          this.totalWeekAgo = 0;
        },
        complete: () => {
          this.totalsHistoryLoading = false;
        },
      });
  }

  private setAccounts(accounts: AccountBalance[]) {
    this.accounts = accounts;
  }

  private getAccountsInCurrency() {
    this.loading = true;
    this.totalsLoading = true;

    this.accountsService.getAccountsBalanceInCurrency(this.currency).subscribe({
      next: (response: ResourceCollection<AccountBalance>) => {
        this.setAccounts(response.resources);
        this.getAccountsTotalWeekAgoInCurrency();
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
