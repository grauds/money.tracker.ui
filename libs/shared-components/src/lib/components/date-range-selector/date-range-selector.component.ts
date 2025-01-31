import { Component, EventEmitter, Input, Output } from '@angular/core';
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
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
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

@Component({
  selector: 'app-date-range-selector',
  templateUrl: './date-range-selector.component.html',
  styleUrl: './date-range-selector.component.sass',
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DateRangeSelectorComponent {
  @Input() loading = false;

  startDate = new FormControl(moment().add(-6, 'M'));

  endDate = new FormControl(moment().add(1, 'M'));

  minDate: Date;

  maxDate: Date;

  @Output() startDate$: EventEmitter<Moment> = new EventEmitter<Moment>();

  @Output() endDate$: EventEmitter<Moment> = new EventEmitter<Moment>();

  constructor() {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 20, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);
  }

  private setDate(
    normalizedMonthAndYear: moment.Moment,
    date: FormControl<any>
  ) {
    const ctrlValue: Moment | undefined = date.value;
    if (ctrlValue) {
      ctrlValue.month(normalizedMonthAndYear.month());
      ctrlValue.year(normalizedMonthAndYear.year());
      date.setValue(ctrlValue);
    }
  }

  setStartMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    datepicker.close();
    this.setDate(normalizedMonthAndYear, this.startDate);
    this.startDate$.next(normalizedMonthAndYear);
  }

  setEndMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    datepicker.close();
    this.setDate(normalizedMonthAndYear, this.endDate);
    this.endDate$.next(normalizedMonthAndYear);
  }

  minusSixMonths() {
    const startMoment: Moment | undefined = this.startDate.value?.add(-6, 'M');
    if (startMoment) {
      this.setDate(startMoment, this.startDate);
      this.startDate$.next(startMoment);
    }
    const endMoment: Moment | undefined = this.endDate.value?.add(-6, 'M');
    if (endMoment) {
      this.setDate(endMoment, this.endDate);
      this.endDate$.next(endMoment);
    }
  }

  plusSixMonths() {
    const startMoment: Moment | undefined = this.startDate.value?.add(6, 'M');
    if (startMoment) {
      this.setDate(startMoment, this.startDate);
      this.startDate$.next(startMoment);
    }
    const endMoment: Moment | undefined = this.endDate.value?.add(6, 'M');
    if (endMoment) {
      this.setDate(endMoment, this.endDate);
      this.endDate$.next(endMoment);
    }
  }
}
