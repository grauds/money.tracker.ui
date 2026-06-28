import { Component, OnDestroy, OnInit } from '@angular/core';
import { Account, MoneyType } from '@clematis-shared/model';
import { Subject, takeUntil } from 'rxjs';
import {
  PagedResourceCollection,
  ResourceCollection,
} from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
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

  accounts: Account[] = [];

  loading = false;

  totalsLoading = false;

  totalsHistoryLoading = false;

  currency: MoneyType;

  currencies: MoneyType[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private readonly accountsService: AccountsService,
    private readonly moneyTypeService: MoneyTypeService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
  ) {
    this.currency = this.moneyTypeService.getSelectedMoneyType();
    this.moneyTypeService.selectedMoneyType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currency = this.moneyTypeService.getSelectedMoneyType();
        this.loadData();
      });
  }

  ngOnInit(): void {
    this.title.setTitle('Accounts');
  }

  updateRoute() {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        currency: this.currency.code,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  loadData() {
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
          this.getAccountsInCurrency();
        },
        error: () => {
          this.loading = false;
        },
      });
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

  private setAccounts(accounts: Account[]) {
    this.accounts = accounts;
  }

  private getAccountsInCurrency() {
    this.loading = true;
    this.totalsLoading = true;

    this.accountsService.getAccountsBalanceInCurrency(this.currency).subscribe({
      next: (response: ResourceCollection<Account>) => {
        this.setAccounts(response.resources);
        this.getAccountsTotalInCurrency();
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
