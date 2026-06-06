import { Component, OnInit } from '@angular/core';
import { AccountBalance, MoneyType } from '@clematis-shared/model';
import { Subscription } from 'rxjs';
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
export class AccountsDashboardComponent implements OnInit {

  // total sum in the chosen currency
  total = 0;

  // total sum week ago in the chosen currency
  totalWeekAgo = 0;

  accountsBalances: AccountBalance[] = [];

  pageSubscription: Subscription;

  loading = false;

  totalsLoading = false;

  totalsHistoryLoading = false;

  currency: MoneyType = new MoneyType();

  currencies: MoneyType[] = [];

  constructor(
    private readonly accountsService: AccountsService,
    private readonly moneyTypeService: MoneyTypeService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly title: Title
  ) {
    this.pageSubscription = route.queryParams.subscribe((queryParams: any) => {
      this.initMoneyType(queryParams['currency'], 'RUB').subscribe(
        (result: MoneyType) => {
          this.currency = result;
          this.loadData();
        }
      );
    });

  }

  initMoneyType(destCurrency: string, fallback: string) {
    if (!destCurrency) {
      destCurrency = fallback;
    }
    return this.moneyTypeService.getCurrencyByCode(destCurrency);
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

  updateCurrency($event: MoneyType) {
    this.currency = $event;

    this.updateRoute().then(() => {
      this.loadData();
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
          this.getAccountsBalanceInCurrency();
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

  private setAccountsBalances(accountsBalances: AccountBalance[]) {
    this.accountsBalances = accountsBalances;
  }

  private getAccountsBalanceInCurrency() {
    this.loading = true;
    this.totalsLoading = true;

    this.accountsService.getAccountsBalanceInCurrency(this.currency).subscribe({
      next: (response: ResourceCollection<AccountBalance>) => {
        this.setAccountsBalances(response.resources);
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
}
