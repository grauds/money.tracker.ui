import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  defaultIfEmpty, distinctUntilChanged,
  finalize,
  forkJoin, map,
  Observable,
  of, Subject,
  switchMap, takeUntil,
  tap,
  throwError
} from 'rxjs';

import {
  ExpenseItem,
  MoneyType,
  Utils,
  WeatherObservation
} from '@clematis-shared/model';
import {
  DayService,
  EntityListComponent,
  ExpenseItemsService,
  IncomeItemsService,
  MoneyTypeService,
  WeatherService
} from '@clematis-shared/shared-components';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ResourceCollection, Sort } from '@lagoshny/ngx-hateoas-client';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrl: './day.component.sass',
  standalone: false,
})
export class DayComponent implements OnInit, OnDestroy {
  @ViewChild(EntityListComponent) entityList!: EntityListComponent<ExpenseItem>;

  loading = false;

  date: string = Utils.formatDate(new Date());

  currency: MoneyType;

  incomeSum = 0;

  displayedIncomeColumns: string[] = [
    'commodity.name',
    'price',
    'organizationname',
  ];

  expensesSum = 0;

  displayedExpenseColumns: string[] = [
    'commodity.name',
    'price',
    'qty',
    'organizationname',
  ];

  weatherData: WeatherObservation | null = null;

  private currentBlobUrl: string | null = null;
  loadedBackgroundImage: string | null = null;
  imageUrl: any = null;

  wpArticle: any = null;

  protected destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected moneyTypeService: MoneyTypeService,
    protected incomeService: IncomeItemsService,
    protected expensesService: ExpenseItemsService,
    private weatherService: WeatherService,
    private dayService: DayService,
    private sanitizer: DomSanitizer,
    private title: Title,
  ) {
    this.currency = this.moneyTypeService.getSelectedMoneyType();
    this.moneyTypeService.selectedMoneyType$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => (this.loading = true)),
      )
      .subscribe(() => {
        this.currency = this.moneyTypeService.getSelectedMoneyType();
        if (this.date) {
          this.loadData().subscribe(() => (this.loading = false));
        }
      });
  }

  ngOnInit(): void {
    this.loading = true;
    this.onInit();
  }

  onInit(): void {
    this.route.paramMap
      .pipe(
        // Listen to ID changes continuously
        map((params) => params.get('date') ?? ''),
        // Only proceed if the date actually changed
        distinctUntilChanged(),
        // Set the loading state before starting the request
        tap((routeDate) => {
          if (!routeDate) {
            routeDate = Utils.formatDate(new Date());
          }
          this.date = routeDate;
          this.title.setTitle(moment(this.date).format('YYYY-MM-DD'));
        }),
        // Cancel previous pending requests if date changes
        switchMap(() => this.loadData()),
        // Clean up subscription when the component destroys
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          // Optional: Handle downstream errors here if needed
        },
      });
  }

  loadData(): Observable<void> {
    this.clearPreviousData();
    this.loading = true;

    const incomeSum$ = this.dayService
      .getIncomeSumByDay(this.date, this.currency)
      .pipe(
        catchError(() => {
          return of(0);
        }),
        defaultIfEmpty(0),
      );

    const expensesSum$ = this.dayService
      .getExpensesSumByDay(this.date, this.currency)
      .pipe(
        catchError(() => {
          return of(0);
        }),
        defaultIfEmpty(0),
      );

    const weather$: Observable<ResourceCollection<WeatherObservation>> =
      this.weatherService.getDay(this.date).pipe(
        catchError(() => {
          const emptyCollection = new ResourceCollection<WeatherObservation>();
          emptyCollection.resources = [];
          return of(emptyCollection);
        }),
        defaultIfEmpty(
          Object.assign(new ResourceCollection<WeatherObservation>(), {
            resources: [],
          }),
        ),
      );

    return forkJoin({
      weather: weather$,
      expensesSum: expensesSum$,
      incomeSum: incomeSum$,
    }).pipe(
      tap((result) => {
        this.expensesSum = result.expensesSum;
        this.incomeSum = result.incomeSum;
        if (
          result.weather &&
          result.weather.resources &&
          result.weather.resources.length > 0
        ) {
          this.weatherData = result.weather.resources[0];
        } else {
          this.weatherData = null;
        }
        this.loadRandomImage(this.date);
      }),
      switchMap(() => {
        return of(undefined);
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => {
        // This runs on 'complete' and 'error'
        this.loading = false;
      }),
    );
  }

  private loadRandomImage(dayString: string): void {
    const defaultPlaceholder = 'assets/weather-placeholder.png';

    this.weatherService.getImage(dayString).subscribe({
      next: (blob: Blob) => {
        // Check if the returned blob is valid and contains actual data
        if (blob && blob.size > 0) {
          // Free up previous browser memory allocation
          if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
          }

          this.currentBlobUrl = URL.createObjectURL(blob);
          this.loadedBackgroundImage = `url('${this.currentBlobUrl}')`;
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(
            this.currentBlobUrl,
          );
        } else {
          // Handle empty response fallback directly
          this.loadedBackgroundImage = `url('${defaultPlaceholder}')`;
          this.imageUrl = defaultPlaceholder;
        }
      },
      error: (err) => {
        console.error(
          'Failed to load weather image, falling back to placeholder',
          err,
        );
        this.loadedBackgroundImage = `url('${defaultPlaceholder}')`;
        this.imageUrl = defaultPlaceholder;
      },
    });
  }

  protected navigateDay(offset: number): void {
    if (this.date) {
      // Parse the current string date (YYYY-MM-DD) safely split by hyphen
      const [year, month, day] = this.date.split('-').map(Number);

      // Create local date object (Month is 0-indexed in JS)
      const currentTarget = new Date(year, month - 1, day);

      // Apply offset (+1 or -1)
      currentTarget.setDate(currentTarget.getDate() + offset);

      // Navigate to the new URL path
      const targetDateString = Utils.formatDate(currentTarget);
      this.router.navigate(['/days', targetDateString]);
    }
  }

  getQueryArguments(): any {
    if (this.date) {
      return {
        startDate: moment(this.date).format('YYYY-MM-DD'),
        endDate: moment(this.date).format('YYYY-MM-DD'),
      };
    }
    return {};
  }

  getQueryName(): string | null {
    return this.date ? 'filtered' : null;
  }

  getSort(): Sort {
    return {
      transferdate: 'DESC',
    };
  }

  clearPreviousData() {
    this.incomeSum = 0;
    this.expensesSum = 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
