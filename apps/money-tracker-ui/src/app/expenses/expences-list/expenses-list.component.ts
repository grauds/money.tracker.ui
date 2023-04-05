import { Component, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { EntityListComponent, ExpenseItemsService } from "@clematis-shared/shared-components";
import { ExpenseItem } from "@clematis-shared/model";
import { Sort } from "@lagoshny/ngx-hateoas-client";
import { FormControl } from "@angular/forms";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import * as moment from 'moment';

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

  name = new FormControl('');

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

  getQueryName(): string {
    return 'filtered';
  }

  setFilter($event: Map<string, string>) {
    this.name.setValue($event.get('name')!);
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
  }

  setNameFilter($event: FocusEvent) {
    let element = $event.target as HTMLInputElement
    this.entityList.setFilter(element.id, element.value)
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
