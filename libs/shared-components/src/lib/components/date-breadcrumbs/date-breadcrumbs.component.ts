import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  url: string[] | null;
}

@Component({
  selector: 'lib-date-breadcrumbs',
  templateUrl: './date-breadcrumbs.component.html',
  styleUrl: './date-breadcrumbs.component.sass',
  standalone: false,
})
export class DateBreadcrumbsComponent implements OnChanges {
  @Input() date: string | null = null;

  path: Array<BreadcrumbItem> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && this.date) {
      this.generateBreadcrumbs();
    }
  }

  private generateBreadcrumbs(): void {
    if (!this.date) {
      this.path = [{ label: 'Home', url: ['/'] }];
      return;
    }

    const parts = this.date.split('-');

    if (parts.length !== 3) {
      this.path = [{ label: 'Home', url: ['/'] }];
      return;
    }

    const [year, month, day] = parts;
    const monthName = this.getMonthName(parseInt(month, 10) - 1);

    this.path = [
      { label: year, url: ['/years', year] },
      { label: monthName, url: ['/months', 'year', year, 'month', month] },
      { label: day, url: null },
    ];
  }

  private getMonthName(monthIndex: number): string {
    const date = new Date(2000, monthIndex, 1);
    return date.toLocaleString('en-US', { month: 'long' });
  }
}
