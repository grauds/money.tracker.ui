import { Component, Input, OnInit } from '@angular/core';
import { ExpenseItem } from '../../../common/model/expense-item';
import {Commodity} from "../../../common/model/commodity";

@Component({
  selector: 'app-expense-item-renderer',
  templateUrl: 'expense-item-renderer.component.html',
  styleUrls: ['expense-item-renderer.component.css']
})
export class ExpenseItemRendererComponent implements OnInit {

  @Input() entity: ExpenseItem = new ExpenseItem();

  commodity: Commodity = new Commodity();

  constructor() { }

  ngOnInit(): void {
    this.entity.getRelation<Commodity>('commodity')
      .subscribe((commodity: Commodity) => {
         this.commodity = commodity
      });
  }

}
