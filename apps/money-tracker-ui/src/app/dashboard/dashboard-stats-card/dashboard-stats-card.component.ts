import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-stats-card',
  templateUrl: './dashboard-stats-card.component.html',
  styleUrls: ['./dashboard-stats-card.component.sass'],
  providers: [CurrencyPipe],
  standalone: false,
})
export class DashboardStatsCardComponent {
  @Input() showSign = false;
  @Input() loading = false;
  @Input() title = '';
  @Input() info = '';
  @Input() value: number | undefined = undefined;
  @Input() subtitle = '';
  @Input() currencyCode = '';
  @Input() positive = false;
  @Input() negative = false;
  @Input() highlight = false;
  @Input() color = '';
  @Input() bg = '';
}
