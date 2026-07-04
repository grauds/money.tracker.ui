import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ExpenseItem, MoneyType, WeatherObservation } from '@clematis-shared/model';
import {
  EntityListComponent,
  ExpenseItemsService, MoneyTypeService,
  WeatherService
} from '@clematis-shared/shared-components';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { Sort } from '@lagoshny/ngx-hateoas-client';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrl: './day.component.sass',
  providers: [{ provide: 'searchService', useClass: ExpenseItemsService }],
  standalone: false,
})
export class DayComponent {
  @ViewChild(EntityListComponent) entityList!: EntityListComponent<ExpenseItem>;

  loading = false;

  date: string = DayComponent.formatDate(new Date());

  currency: MoneyType;

  incomeSum = 0;

  expensesSum = 0;

  displayedColumns: string[] = [
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected moneyTypeService: MoneyTypeService,
    private weatherService: WeatherService,
    private sanitizer: DomSanitizer,
    private title: Title,
  ) {
    this.currency = this.moneyTypeService.getSelectedMoneyType();

    this.route.paramMap.subscribe((params) => {
      let routeDate = params.get('date');
      if (!routeDate) {
        routeDate = DayComponent.formatDate(new Date());
      }
      this.date = routeDate;
      this.title.setTitle(moment(this.date).format('YYYY-MM-DD'));
      this.loadData();
    });
  }

  loadData(): void {
    this.loading = true;

    this.weatherService.getDay(this.date).subscribe({
      next: (response: any) => {
        this.weatherData = response._embedded?.observations[0]
          ? new WeatherObservation(response._embedded?.observations[0])
          : null;
        this.loadRandomImage(this.date);
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
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
      const targetDateString = DayComponent.formatDate(currentTarget);
      this.router.navigate(['/days', targetDateString]);
    }
  }

  // Helper to safely build local YYYY-MM-DD string
  private static formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
}
