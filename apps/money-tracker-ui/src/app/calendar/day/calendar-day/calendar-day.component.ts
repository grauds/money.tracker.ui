import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-calendar-day',
  imports: [
    DatePipe,
    UpperCasePipe
  ],
  templateUrl: './calendar-day.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './calendar-day.component.sass',
})
export class CalendarDayComponent {
  @Input() date = '';
}
