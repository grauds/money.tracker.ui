import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-day-link',
  styleUrls: ['./day-link.component.sass'],
  template: `
    <a [routerLink]="['/days', date | date: urlFormat]" class="day-link">
      {{ date | date: displayFormat }}
    </a>
  `,
  standalone: false
})
export class DayLinkComponent {
  @Input({ required: true }) date!: string | Date;
  @Input() displayFormat = 'fullDate';
  @Input() urlFormat = 'yyyy-MM-dd';
}
