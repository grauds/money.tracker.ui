import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  Subject,
  takeUntil,
  finalize,
  catchError,
  of,
  switchMap,
  merge,
  tap,
} from 'rxjs';
import { formatDate } from '@angular/common';

import {
  DashboardStats,
  MoneyType,
  InfoAbout,
  IncomeByCurrency,
  ExpenseByCurrency, CategoryAmountItem
} from '@clematis-shared/model';
import {
  AccountsService,
  ExpenseService,
  IncomeService,
  MoneyTypeService,
  StatsService
} from '@clematis-shared/shared-components';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DashboardComponent implements OnInit, OnDestroy {
  currency: MoneyType = this.moneyTypeService.getSelectedMoneyType();

  infoLoading = false;
  infoAbout: InfoAbout | undefined;

  totalsLoading = false;
  total = 0;

  totalsHistoryLoading = false;
  totalWeekAgo = 0;

  totalIncomeLoading = false;
  totalIncome: number | undefined;

  totalExpenseLoading = false;
  totalExpense: number | undefined;

  incomeByCurrencyLoading = false;
  incomeByCurrency: IncomeByCurrency[] = [];

  expenseByCurrencyLoading = false;
  expenseByCurrency: ExpenseByCurrency[] = [];

  incomeByCategory = signal<CategoryAmountItem[]>([]);
  incomeByOrganization = signal<CategoryAmountItem[]>([]);
  incomeByCategoryLoading = signal<boolean>(false);
  incomeByOrganizationLoading = signal<boolean>(false);

  expenseByCategory = signal<CategoryAmountItem[]>([]);
  expenseByOrganization = signal<CategoryAmountItem[]>([]);
  expenseByCategoryLoading = signal<boolean>(false);
  expenseByOrganizationLoading = signal<boolean>(false);

  incomeGroupBy = signal<'category' | 'organization'>('category');
  expenseGroupBy = signal<'category' | 'organization'>('category');

  stats: DashboardStats | null = null;
  today = new Date();
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private title: Title,
    private readonly statsService: StatsService,
    private readonly moneyTypeService: MoneyTypeService,
    private readonly incomeService: IncomeService,
    private readonly expensesService: ExpenseService,
    private readonly accountsService: AccountsService,
  ) {
    this.loadInfoAbout();

    this.moneyTypeService.selectedMoneyType$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.currency = this.moneyTypeService.getSelectedMoneyType();
          this.errorMessage = null;
        }),
        switchMap(() =>
          merge(
            this.loadIncome$(),
            this.loadExpense$(),
            this.loadIncomeByCurrency$(),
            this.loadExpenseByCurrency$(),
            this.loadIncomeByCategory$(),
            this.loadExpenseByCategory$(),
            this.loadIncomeByOrganization$(),
            this.loadExpenseByOrganization$(),
            this.getAccountsTotal$(),
            this.getAccountsTotalWeekAgo$(),
          ),
        ),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.title.setTitle('Money Tracker — Dashboard');
  }

  private loadInfoAbout(): void {
    this.infoLoading = true;

    this.statsService
      .getInfoAbout()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.errorMessage = 'Failed to load summary info';
          return of(undefined);
        }),
        finalize(() => (this.infoLoading = false)),
      )
      .subscribe((info) => {
        this.infoAbout = info;
      });
  }

  private loadIncome$() {
    if (!this.currency) {
      this.totalIncome = undefined;
      return of(undefined);
    }

    this.totalIncomeLoading = true;

    return this.incomeService.total(this.currency.code).pipe(
      tap((total) => (this.totalIncome = total)),
      catchError(() => {
        this.errorMessage = 'Failed to load income';
        return of(undefined);
      }),
      finalize(() => (this.totalIncomeLoading = false)),
    );
  }

  private loadExpense$() {
    if (!this.currency) {
      this.totalExpense = undefined;
      return of(undefined);
    }

    this.totalExpenseLoading = true;

    return this.expensesService.total(this.currency.code).pipe(
      tap((expensesTotal) => (this.totalExpense = expensesTotal)),
      catchError(() => {
        this.errorMessage = 'Failed to load expenses';
        return of(undefined);
      }),
      finalize(() => (this.totalExpenseLoading = false)),
    );
  }

  private loadIncomeByCurrency$() {
    if (!this.currency) {
      this.incomeByCurrency = [];
      return of([]);
    }

    this.incomeByCurrencyLoading = true;

    return this.incomeService.totalByCurrency(this.currency.code).pipe(
      tap((items) => (this.incomeByCurrency = items ?? [])),
      catchError(() => {
        this.errorMessage = 'Failed to load income breakdown';
        this.incomeByCurrency = [];
        return of([]);
      }),
      finalize(() => (this.incomeByCurrencyLoading = false)),
    );
  }

  private loadExpenseByCurrency$() {
    if (!this.currency) {
      this.expenseByCurrency = [];
      return of([]);
    }

    this.expenseByCurrencyLoading = true;

    return this.expensesService.totalByCurrency(this.currency.code).pipe(
      tap((items) => (this.expenseByCurrency = items ?? [])),
      catchError(() => {
        this.errorMessage = 'Failed to load expense breakdown';
        this.expenseByCurrency = [];
        return of([]);
      }),
      finalize(() => (this.expenseByCurrencyLoading = false)),
    );
  }

  private loadIncomeByOrganization$() {
    if (!this.currency) {
      this.incomeByOrganization.set([]);
      return of([]);
    }

    this.incomeByOrganizationLoading.set(true);

    return this.incomeService.totalByOrganizations(this.currency.code).pipe(
      tap((items) => this.incomeByOrganization.set(items ?? [])),
      catchError(() => {
        this.errorMessage = 'Failed to load income by organization';
        this.incomeByOrganization.set([]);
        return of([]);
      }),
      finalize(() => this.incomeByOrganizationLoading.set(false)),
    );
  }

  private loadExpenseByOrganization$() {
    if (!this.currency) {
      this.expenseByOrganization.set([]);
      return of([]);
    }

    this.expenseByOrganizationLoading.set(true);

    return this.expensesService.totalByOrganizations(this.currency.code).pipe(
      tap((items) => this.expenseByOrganization.set(items ?? [])),
      catchError(() => {
        this.errorMessage = 'Failed to load expenses by organization';
        this.expenseByOrganization.set([]);
        return of([]);
      }),
      finalize(() => this.expenseByOrganizationLoading.set(false)),
    );
  }

  private loadIncomeByCategory$() {
    if (!this.currency) {
      this.incomeByCategory.set([]);
      return of([]);
    }

    this.incomeByCategoryLoading.set(true);

    return this.incomeService.totalByCategories(this.currency.code).pipe(
      tap((items) => this.incomeByCategory.set(items ?? [])),
      catchError(() => {
        this.errorMessage = 'Failed to load income by category';
        this.incomeByCategory.set([]);
        return of([]);
      }),
      finalize(() => this.incomeByCategoryLoading.set(false)),
    );
  }

  private loadExpenseByCategory$() {
    if (!this.currency) {
      this.expenseByCategory.set([]);
      return of([]);
    }

    this.expenseByCategoryLoading.set(true);

    return this.expensesService.totalByCategories(this.currency.code).pipe(
      tap((items) => this.expenseByCategory.set(items ?? [])),
      catchError(() => {
        this.errorMessage = 'Failed to load expenses by category';
        this.expenseByCategory.set([]);
        return of([]);
      }),
      finalize(() => this.expenseByCategoryLoading.set(false)),
    );
  }

  private getAccountsTotal$() {
    this.totalsLoading = true;
    return this.accountsService.getAccountsTotalInCurrency(this.currency).pipe(
      tap((total) => (this.total = total)),
      catchError(() => {
        this.total = 0;
        return of(0);
      }),
      finalize(() => (this.totalsLoading = false)),
    );
  }

  private getAccountsTotalWeekAgo$() {
    this.totalsHistoryLoading = true;
    return this.accountsService
      .getAccountsTotalHistoryInCurrency(this.currency, 7)
      .pipe(
        tap((total) => (this.totalWeekAgo = total)),
        catchError(() => {
          if (this.totalWeekAgo === undefined) {
            this.totalWeekAgo = 0;
          }
          return of(0);
        }),
        finalize(() => (this.totalsHistoryLoading = false)),
      );
  }

  activeIncomeTitle = computed(() =>
    this.incomeGroupBy() === 'category' ? 'Top Expenses' : 'Top Expenses',
  );

  activeIncomeItems = computed(() =>
    this.incomeGroupBy() === 'category'
      ? this.incomeByCategory()
      : this.incomeByOrganization(),
  );

  activeIncomeLoading = computed(() =>
    this.incomeGroupBy() === 'category'
      ? this.incomeByCategoryLoading()
      : this.incomeByOrganizationLoading(),
  );

  activeExpenseTitle = computed(() =>
    this.expenseGroupBy() === 'category' ? 'Top Expenses' : 'Top Expenses',
  );

  activeExpenseItems = computed(() =>
    this.expenseGroupBy() === 'category'
      ? this.expenseByCategory()
      : this.expenseByOrganization(),
  );

  activeExpenseLoading = computed(() =>
    this.expenseGroupBy() === 'category'
      ? this.expenseByCategoryLoading()
      : this.expenseByOrganizationLoading(),
  );

  getLastDate(): string {
    if (this.infoAbout?.dates?.end) {
      return formatDate(this.infoAbout.dates.end, 'mediumDate', 'en_US');
    }
    return 'No date';
  }

  get netSavings(): number | undefined {
    if (this.totalIncome === undefined || this.totalExpense === undefined) {
      return undefined;
    }
    return this.totalIncome - this.totalExpense;
  }

  get savingsRate(): number {
    if (
      !this.totalIncome ||
      this.totalIncome <= 0 ||
      this.netSavings === undefined
    ) {
      return 0;
    }
    return (this.netSavings / this.totalIncome) * 100;
  }

  get savingsSubtitle(): string {
    if (this.netSavings === undefined) {
      return '';
    }
    const formattedRate = (Math.round(this.savingsRate * 10) / 10).toFixed(1);
    return `savings rate: ${formattedRate}%`;
  }

  get netSavingsLoading(): boolean {
    return this.totalIncomeLoading || this.totalExpenseLoading;
  }

  formatCurrency(value: number): number {
    return Math.round(value * 100) / 100;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
