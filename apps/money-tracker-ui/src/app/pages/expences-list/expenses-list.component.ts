import { Component, OnInit } from '@angular/core';
import { HateoasResourceService, Sort } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseItem } from '@clematis-shared/model';

import { EntityListComponent } from '@clematis-shared/shared-components';
import { ExpenseItemRendererComponent } from './expense-item-renderer/expense-item-renderer.component';

@Component({
  selector: 'app-expenses-list',
  templateUrl: 'expenses-list.component.html',
  styleUrls: ['expenses-list.component.css']
})
export class ExpensesListComponent extends EntityListComponent<ExpenseItem> implements OnInit {


  constructor(resourceService: HateoasResourceService, router: Router, route: ActivatedRoute) {
    super(ExpenseItem, resourceService, router, route, new ExpenseItemRendererComponent())

    this.path = 'expenses'
  }

  ngOnInit(): void {
    super.onInit()
  }

  override getSortOption() {
    let ret: Sort = {
      transferDate: 'ASC'
    }

    return ret
  }

}
