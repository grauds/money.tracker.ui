import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { EntityElementComponent } from './components/entity-element/entity-element.component';
import { PaginationBarComponent } from './components/pagination-bar/pagination-bar.component';
import { PageSizeComponent } from './components/page-size/page-size.component';
import { SearchComponent } from './components/search/search.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EntityListComponent } from './components/entity-list/entity-list.component';
import { MatPaginatorModule } from '@angular/material/paginator';

import { AccountsService } from "./service/accounts.service";
import { OrganizationsService } from './service/organizations.service';
import { CommoditiesService } from './service/commodities.service';
import { CommodityGroupsService } from './service/commodity-groups.service';
import { OrganizationGroupsService } from './service/organization-groups.service';
import { ExpenseItemsService } from './service/expense-items.service';
import { MatTableModule } from "@angular/material/table";
import { LastCommodityService } from "./service/last-commodity.service";
import { MoneyExchangeService } from "./service/money-exchange.service";
import {ContentLoaderModule} from "@ngneat/content-loader";

@NgModule({
  imports: [CommonModule, RouterModule, MatIconModule, MatPaginatorModule, MatTableModule, ContentLoaderModule],
  exports: [EntityElementComponent, BreadcrumbsComponent, EntityListComponent],
  declarations: [
    EntityListComponent,
    BreadcrumbsComponent,
    EntityElementComponent,
    PaginationBarComponent,
    PageSizeComponent,
    SearchComponent
  ],
  providers: [
    AccountsService,
    OrganizationsService,
    CommoditiesService,
    CommodityGroupsService,
    OrganizationGroupsService,
    ExpenseItemsService,
    LastCommodityService,
    MoneyExchangeService
  ],
})
export class SharedComponentsModule {}
