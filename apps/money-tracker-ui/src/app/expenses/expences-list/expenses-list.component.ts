import { Component, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { EntityListComponent, ExpenseItemsService } from "@clematis-shared/shared-components";
import { ExpenseItem } from "@clematis-shared/model";
import { Sort } from "@lagoshny/ngx-hateoas-client";

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

  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Expenses')
  }

  getSort() {
    let ret: Sort = {
      transferdate: 'DESC'
    }
    return ret
  }

}
