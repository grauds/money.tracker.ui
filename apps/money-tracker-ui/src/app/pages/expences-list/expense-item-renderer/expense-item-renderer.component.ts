import { Component, Input, OnInit } from '@angular/core';
import { Entity, ExpenseItem } from '@clematis-shared/model';
import { Commodity } from '@clematis-shared/model';
import { Organization } from '@clematis-shared/model';

@Component({
  selector: 'app-expense-item-renderer',
  templateUrl: 'expense-item-renderer.component.html',
  styleUrls: ['expense-item-renderer.component.css']
})
export class ExpenseItemRendererComponent implements OnInit {

  @Input() entity: ExpenseItem = new ExpenseItem();

  commodity: String | undefined;

  organization: String | undefined;

  commodityName: string | undefined;

  organizationName: string | undefined;

  constructor() { }

  ngOnInit(): void {
    this.entity.getRelation<Commodity>('commodity')
      .subscribe((commodity: Commodity) => {
        this.commodity = Entity.getRelativeSelfLinkHref(commodity)
        this.commodityName = commodity.name
      });

    this.entity.getRelation<Organization>('tradeplace')
      .subscribe((organization: Organization) => {
        this.organization = Entity.getRelativeSelfLinkHref(organization)
        this.organizationName = organization.name
      });
  }

}
