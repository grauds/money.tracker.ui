import { ErrorHandler, NgModule } from '@angular/core';
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

import { AccountsService } from './service/accounts.service';
import { OrganizationsService } from './service/organizations.service';
import { CommoditiesService } from './service/commodities.service';
import { CommodityGroupsService } from './service/commodity-groups.service';
import { OrganizationGroupsService } from './service/organization-groups.service';
import { ExpenseItemsService } from './service/expense-items.service';
import { MatTableModule } from '@angular/material/table';
import { LastCommodityService } from './service/last-commodity.service';
import { MoneyExchangeService } from './service/money-exchange.service';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { ErrorDialogService } from './error/error-dialog.service';
import { GlobalErrorHandler } from './error/global-error-handler';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandlerInterceptor } from './error/error-handler.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { InOutService } from './service/in-out.service';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonToggleModule } from "@angular/material/button-toggle";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    ContentLoaderModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule
  ],
  exports: [EntityElementComponent, BreadcrumbsComponent, EntityListComponent],
  declarations: [
    EntityListComponent,
    BreadcrumbsComponent,
    EntityElementComponent,
    PaginationBarComponent,
    PageSizeComponent,
    SearchComponent,
    ErrorDialogComponent,
    PageNotFoundComponent,
  ],
  providers: [
    AccountsService,
    OrganizationsService,
    CommoditiesService,
    CommodityGroupsService,
    OrganizationGroupsService,
    ExpenseItemsService,
    InOutService,
    LastCommodityService,
    MoneyExchangeService,
    ErrorDialogService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true,
    },
  ],
})
export class SharedComponentsModule {}
