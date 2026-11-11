import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: './dashboard-chart-container.component.html',
  styleUrls: ['./dashboard-chart-container.component.sass'],
  standalone: false,
})
export class DashboardChartContainerComponent {
  @Input() title = '';
  @Input() options = {};
  @Input() loading = false;
}
