import { Component, OnInit } from '@angular/core';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute } from '@angular/router';
import { EntityListComponent } from '../../common/widgets/entity-list/entity-list.component';
import { ExpenseItem } from '../../common/model/expense-item';
import { ExpenseItemRendererComponent } from './expense-item-renderer/expense-item-renderer.component';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-expenses-list',
  templateUrl: 'expenses-list.component.html',
  styleUrls: ['expenses-list.component.css']
})
export class ExpensesListComponent extends EntityListComponent<ExpenseItem> implements OnInit {

  // date
  model: NgbDateStruct | undefined;

  constructor(resourceService: HateoasResourceService, route: ActivatedRoute) {
    super(ExpenseItem, resourceService, route, new ExpenseItemRendererComponent())

    this.path = 'expenses'
  }

  ngOnInit(): void {
    super.onInit()
  }


}
