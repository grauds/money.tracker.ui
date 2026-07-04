import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Sort } from '@lagoshny/ngx-hateoas-client';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ExpenseItem } from '@clematis-shared/model';

import { Title } from '@angular/platform-browser';
import { EntityListComponent, ExpenseItemsService } from '@clematis-shared/shared-components';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-expenses-list',
  templateUrl: 'expenses-list.component.html',
  styleUrls: ['expenses-list.component.sass'],
  providers: [{ provide: 'searchService', useClass: ExpenseItemsService }],
  standalone: false,
})
export class ExpensesListComponent implements OnInit, OnDestroy {
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<ExpenseItem>;

  displayedColumns: string[] = [
    'transferdate',
    'commodity.name',
    'price',
    'qty',
    'organizationname',
  ];

  startDate: FormControl<Date> = new FormControl();

  endDate: FormControl<Date> = new FormControl();

  constructor(
    private readonly title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Expenses');
  }

  getQueryArguments(): any {
    if (this.startDate.value || this.endDate.value) {
      return {
        ...(this.startDate?.value && {
          startDate: moment(this.startDate.value).format('YYYY-MM-DD'),
        }),
        ...(this.endDate?.value && {
          endDate: moment(this.endDate.value).format('YYYY-MM-DD'),
        }),
      };
    }
    return {};
  }

  getQueryName(): string | null {
    return this.startDate.value && this.endDate.value ? 'filtered' : null;
  }

  getSort(): Sort {
    return {
      transferdate: 'DESC',
    };
  }

  updateFilter($event: Map<string, string>) {
    if ($event.has('startDate')) {
      const rawStart = $event.get('startDate');
      if (rawStart) {
        this.startDate.setValue(moment(rawStart, 'YYYY-MM-DD').toDate(), {
          emitEvent: false,
        });
      } else {
        this.startDate.reset(undefined, { emitEvent: false });
      }
    }

    if ($event.has('endDate')) {
      const rawEnd = $event.get('endDate');
      if (rawEnd) {
        this.endDate.setValue(moment(rawEnd, 'YYYY-MM-DD').toDate(), {
          emitEvent: false,
        });
      } else {
        this.endDate.reset(undefined, { emitEvent: false });
      }
    }
  }

  setStartDate($event: MatDatepickerInputEvent<Date>) {
    if ($event.value) {
      this.entityList.setFilter(
        'startDate',
        moment($event.value).format('YYYY-MM-DD'),
      );
    } else {
      this.entityList.removeFilter('startDate');
    }
  }

  setEndDate($event: MatDatepickerInputEvent<Date>) {
    if ($event.value) {
      this.entityList.setFilter(
        'endDate',
        moment($event.value).format('YYYY-MM-DD'),
      );
    } else {
      this.entityList.removeFilter('endDate');
    }
  }

  getStartDate() {
    return moment(this.startDate.value);
  }

  getEndDate() {
    return moment(this.endDate.value);
  }

  ngOnDestroy(): void {
    console.log(
      'ExpensesListComponent: Destroy hook triggered. Unsubscribing page parameters stream.',
    );
    //this.pageSubscription?.unsubscribe();
  }
}
