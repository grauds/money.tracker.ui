import { Component, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { FormControl } from "@angular/forms";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";

import { Sort } from "@lagoshny/ngx-hateoas-client";

import {
  EntityListComponent,
  ExpenseItemsService
} from "@clematis-shared/shared-components";
import { ExpenseItem } from '@clematis-shared/model';

import * as _moment from "moment"
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-expenses-list',
  templateUrl: 'expenses-list.component.html',
  styleUrls: ['expenses-list.component.sass'],
  providers: [
    { provide: 'searchService', useClass: ExpenseItemsService }
  ]
})
export class ExpensesListComponent implements OnInit {

  displayedColumns: string[] = ['transferdate', 'commodity.name', 'price', 'qty', 'organizationname'];

  @ViewChild(EntityListComponent) entityList!: EntityListComponent<ExpenseItem>;

  startDate: FormControl<Date> = new FormControl();

  endDate: FormControl<Date> = new FormControl();

  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Expenses')
  }

  getSort(): Sort {
    return {
      transferdate: 'DESC'
    }
  }

  getQueryName(): string | null {
    return (this.startDate.value && this.endDate.value) ? 'filtered' : null;
  }

  setFilter($event: Map<string, string>) {

    if ($event.get('startDate')) {
      this.startDate.setValue(moment($event.get('startDate'), 'YYYY-MM-DD').toDate());
    } else {
      this.startDate.reset()
    }

    if ($event.get('endDate')) {
      this.endDate.setValue(moment($event.get('endDate'), 'YYYY-MM-DD').toDate());
    } else {
      this.endDate.reset()
    }

    this.entityList.refreshData({
      queryArguments: {},
      queryName: this.getQueryName()
    })
  }

  setStartDate($event: MatDatepickerInputEvent<Date>) {
    if ($event.value) {
      this.entityList.setFilter('startDate', moment($event.value).format('YYYY-MM-DD'))
    } else {
      this.entityList.removeFilter('startDate')
    }
  }

  setEndDate($event: MatDatepickerInputEvent<Date>) {
    if ($event.value) {
      this.entityList.setFilter('endDate', moment($event.value).format('YYYY-MM-DD'))
    } else {
      this.entityList.removeFilter('endDate')
    }
  }

  getStartDate() {
    return moment(this.startDate.value)
  }

  getEndDate() {
    return moment(this.endDate.value)
  }
}
