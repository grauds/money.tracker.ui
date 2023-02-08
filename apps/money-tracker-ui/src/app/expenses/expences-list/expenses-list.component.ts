import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { ExpenseItemsService } from "@clematis-shared/shared-components";

@Component({
  selector: 'app-expenses-list',
  templateUrl: 'expenses-list.component.html',
  styleUrls: ['expenses-list.component.sass'],
  providers: [
    { provide: 'searchService', useClass: ExpenseItemsService }
  ]
})
export class ExpensesListComponent implements OnInit {

  displayedColumns: string[] = ['transferdate', 'name', 'price', 'qty', 'organizationname'];

  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Expenses')
  }

}
