import { Component, Input, OnInit } from '@angular/core';
import { ExpenseItem } from '../../../common/model/expense-item';

@Component({
  selector: 'app-expense-item-renderer',
  templateUrl: 'expense-item-renderer.component.html',
  styleUrls: ['expense-item-renderer.component.css']
})
export class ExpenseItemRendererComponent implements OnInit {

  @Input() entity: ExpenseItem = new ExpenseItem();

  constructor() { }

  ngOnInit(): void {
  }

}
