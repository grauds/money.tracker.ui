import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Sort } from '@lagoshny/ngx-hateoas-client';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

  syncingDateRange = false;

  readonly range = new FormGroup({
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
  });

  constructor(
    private readonly title: Title,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Expenses');
    this.updateFilter(
      this.parseDateFilters(
        (this.route.snapshot.queryParams ?? {}) as Record<
          string,
          string | undefined
        >,
      ),
    );
  }

  getQueryArguments(): any {
    if (
      this.range.controls.startDate.value &&
      this.range.controls.endDate.value
    ) {
      return {
        ...(this.range.controls.startDate?.value && {
          startDate: this.getStartDate(),
        }),
        ...(this.range.controls.endDate?.value && {
          endDate: this.getEndDate(),
        }),
      };
    }
    return {};
  }

  getQueryName(): string | null {
    return this.range.controls.startDate.value &&
      this.range.controls.endDate.value
      ? 'filtered'
      : null;
  }

  getSort(): Sort {
    return {
      transferdate: 'DESC',
    };
  }

  updateFilter($event: Map<string, string>) {
    this.syncingDateRange = true;
    try {
      if ($event.has('startDate')) {
        const rawStart = $event.get('startDate');
        if (rawStart) {
          this.range.controls.startDate.setValue(
            moment(rawStart, 'YYYY-MM-DD').toDate(),
            {
              emitEvent: false,
            },
          );
        } else {
          this.range.controls.startDate.setValue(null, { emitEvent: false });
        }
      } else {
        this.range.controls.startDate.setValue(null, { emitEvent: false });
      }

      if ($event.has('endDate')) {
        const rawEnd = $event.get('endDate');
        if (rawEnd) {
          this.range.controls.endDate.setValue(
            moment(rawEnd, 'YYYY-MM-DD').toDate(),
            {
              emitEvent: false,
            },
          );
        } else {
          this.range.controls.endDate.setValue(null, { emitEvent: false });
        }
      } else {
        this.range.controls.endDate.setValue(null, { emitEvent: false });
      }
    } finally {
      this.syncingDateRange = false;
    }
  }

  private parseDateFilters(
    queryParams: Record<string, string | undefined>,
  ): Map<string, string> {
    const result = new Map<string, string>();
    ['startDate', 'endDate'].forEach((key) => {
      const value = queryParams[key];
      if (value) {
        result.set(key, value);
      }
    });
    return result;
  }

  setStartDate($event: MatDatepickerInputEvent<Date>) {
    if (this.syncingDateRange) {
      return;
    }
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
    if (this.syncingDateRange) {
      return;
    }
    if ($event.value) {
      this.entityList.setFilter(
        'endDate',
        moment($event.value).format('YYYY-MM-DD'),
      );
    } else {
      this.entityList.removeFilter('endDate');
    }
  }

  getStartDate(): string {
    return moment(this.range.controls.startDate.value).format('YYYY-MM-DD');
  }

  getEndDate(): string {
    return moment(this.range.controls.endDate.value).format('YYYY-MM-DD');
  }

  ngOnDestroy(): void {
    console.log(
      'ExpensesListComponent: Destroy hook triggered. Unsubscribing page parameters stream.',
    );
  }
}
