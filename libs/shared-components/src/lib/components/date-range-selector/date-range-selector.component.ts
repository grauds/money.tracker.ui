import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

const STORAGE_KEY = 'date_range_selector_state';

@Component({
  selector: 'app-date-range-selector',
  templateUrl: './date-range-selector.component.html',
  styleUrl: './date-range-selector.component.sass',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DateRangeSelectorComponent implements OnInit {
  @Input() loading = false;

  startDate = new FormControl<Moment | null>(moment().subtract(24, 'months'));
  endDate = new FormControl<Moment | null>(moment().add(1, 'months'));

  minDate: Date;
  maxDate: Date;

  @Output() startDate$ = new EventEmitter<Moment>();
  @Output() endDate$ = new EventEmitter<Moment>();

  private hasRestoredState = false;

  constructor() {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 30, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);

    this.hasRestoredState = this.restoreState();
  }

  ngOnInit(): void {
    if (this.hasRestoredState && this.startDate.value && this.endDate.value) {
      const start = this.startDate.value.clone();
      const end = this.endDate.value.clone();

      queueMicrotask(() => {
        this.startDate$.emit(start);
        this.endDate$.emit(end);
      });
    }
  }

  private restoreState(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return false;
      }

      const { start, end } = JSON.parse(raw);
      const parsedStart = moment(start, 'YYYY-MM', true);
      const parsedEnd = moment(end, 'YYYY-MM', true);

      if (parsedStart.isValid() && parsedEnd.isValid()) {
        this.startDate.setValue(parsedStart);
        this.endDate.setValue(parsedEnd);
        return true;
      }
    } catch {
      // Ignore storage errors (e.g., private browsing restrictions or corrupted data)
    }
    return false;
  }

  private saveState(): void {
    const start = this.startDate.value;
    const end = this.endDate.value;
    if (!start || !end) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          start: start.format('YYYY-MM'),
          end: end.format('YYYY-MM'),
        }),
      );
    } catch {
      // Ignore quota or storage access errors
    }
  }

  private setDate(
    normalizedMonthAndYear: Moment,
    date: FormControl<Moment | null>,
  ): void {
    const current = date.value ? date.value.clone() : moment();
    current
      .year(normalizedMonthAndYear.year())
      .month(normalizedMonthAndYear.month());
    date.setValue(current);
  }

  setStartMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>,
  ): void {
    datepicker.close();
    this.setDate(normalizedMonthAndYear, this.startDate);
    this.saveState();
    if (this.startDate.value) {
      this.startDate$.emit(this.startDate.value.clone());
    }
  }

  setEndMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>,
  ): void {
    datepicker.close();
    this.setDate(normalizedMonthAndYear, this.endDate);
    this.saveState();
    if (this.endDate.value) {
      this.endDate$.emit(this.endDate.value.clone());
    }
  }

  /**
   * Shifts both start and end dates by 50% of the currently selected month span.
   * @param direction -1 for backward, 1 for forward
   */
  shiftRange(direction: -1 | 1): void {
    const start = this.startDate.value;
    const end = this.endDate.value;
    if (!start || !end) return;

    const spanInMonths = Math.abs(end.diff(start, 'months'));
    // Ensure a minimum shift of 1 month so navigation doesn't stall on 0- or 1-month ranges
    const stepMonths = Math.max(1, Math.round(spanInMonths * 0.5)) * direction;

    const nextStart = start.clone().add(stepMonths, 'months');
    const nextEnd = end.clone().add(stepMonths, 'months');

    this.startDate.setValue(nextStart);
    this.endDate.setValue(nextEnd);
    this.saveState();

    this.startDate$.emit(nextStart.clone());
    this.endDate$.emit(nextEnd.clone());
  }
}
