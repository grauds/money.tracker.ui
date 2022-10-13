import { Component, Input, OnInit } from '@angular/core';
import { ExpenseItem } from '../../../../../../../libs/model/src/model/expense-item';
import { Commodity } from '../../../../../../../libs/model/src/model/commodity';
import { Organization } from '../../../../../../../libs/model/src/model/organization';
import { Utils } from '../../../common/utils/utils';

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
        this.commodity = Utils.parseResourceUrlToAppUrl(commodity.getSelfLinkHref())
        this.commodityName = commodity.name
      });

    this.entity.getRelation<Organization>('tradeplace')
      .subscribe((organization: Organization) => {
        this.organization = Utils.parseResourceUrlToAppUrl(organization.getSelfLinkHref())
        this.organizationName = organization.name
      });
  }

}
