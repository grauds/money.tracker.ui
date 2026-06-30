import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { WeatherObservation } from '@clematis-shared/model';
import { WeatherService } from '@clematis-shared/shared-components';


@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrl: './day.component.sass',
  standalone: false,
})
export class DayComponent {
  loading = false;

  date: string = DayComponent.formatDate(new Date());

  wpCoverImage: string | null = null;

  wpArticle: any = null;

  weatherData: WeatherObservation | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weatherService: WeatherService,
  ) {
    this.route.paramMap.subscribe((params) => {
      let routeDate = params.get('date');
      if (!routeDate) {
        routeDate = DayComponent.formatDate(new Date());
      }

      this.date = routeDate;
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
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });

    this.wpArticle = {
      title: 'Exploring the Evolution of Personal Ledger Management Systems',
      subtitle:
        'How tracking daily data can yield unexpected insights over decades.',
      content: `
        <p>The practice of maintaining a detailed personal ledger stretches back centuries,
        long before modern cloud synchronization apps existed. Historically, individuals relied on
        leather-bound journals and heavy ink pens to catalog their transactions, local crop values,
        and weather observations. Today, integrating these metrics into unified digital workspaces allows
        us to visualize our lives with structural clarity.</p>

        <p>When tracking daily financial operations—such as expenses, income, currency exchanges,
        and bank transfers—patterns emerge that are completely invisible over shorter windows.
        For instance, seasonal fluctuations in utility billing, variable local transit costs, and subtle
        shifts in food spending reveal deeper behavior mechanisms. Layering historical weather
        observations over these transactional sheets can expose fascinating links between atmospheric variables
        and our consumption behaviors.</p>

        <p>As digital architecture shifts toward lightweight, modular user interfaces, the friction of
        daily logging continues to decrease. Modern component-driven systems isolate transaction ledgers, external
        content feeds, and localized sensor data into clear, self-contained widgets. Maintaining this structural
        separation guarantees that our personal analytics platforms remain scalable, clean, and highly adaptive to
        changing habits over the decades.</p>
      `,
    };
  }

  ngOnInit(): void {
    this.date =
      this.route.snapshot.paramMap.get('date') ??
      new Date().toISOString().split('T')[0];
    this.loadData();
  }

  /**
   * Computes the background image styling safely.
   * Swaps to a clean default placeholder if the WordPress asset is missing.
   */
  get dashboardBackgroundImage(): string {
    const defaultPlaceholder = 'assets/weather-placeholder.png';
    const imageUrl = this.wpCoverImage || defaultPlaceholder;
    return `url('${imageUrl}')`;
  }


  navigateDay(offset: number): void {
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

}
