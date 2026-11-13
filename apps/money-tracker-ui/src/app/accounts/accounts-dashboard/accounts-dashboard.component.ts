import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AccountsDashboardComponent implements OnInit, OnDestroy {

  accounts: AccountBalance[] = [];

  loading = false;

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
    this.getAccountsInCurrency();
  }

  private setAccounts(accounts: AccountBalance[]) {
    this.accounts = accounts;
  }

  private getAccountsInCurrency() {
    this.loading = true;

    this.accountsService.getAccountsBalanceInCurrency(this.currency).subscribe({
      next: (response: ResourceCollection<AccountBalance>) => {
        this.setAccounts(response.resources);
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
