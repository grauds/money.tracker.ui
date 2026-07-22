import { Component, Input } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-calendar-day',
  imports: [
    DatePipe,
    UpperCasePipe
  ],
  templateUrl: './calendar-day.component.html',
  styleUrl: './calendar-day.component.sass',
})
export class CalendarDayComponent {
  @Input() date = '';
}
