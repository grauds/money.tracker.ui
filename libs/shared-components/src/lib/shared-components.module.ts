import { ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatGridListModule} from '@angular/material/grid-list';

import { LastCommodityService } from './service/last-commodity.service';
import { MoneyExchangeService } from './service/money-exchange.service';
import { CommodityGroupService } from './service/commodity-group.service';
import { MoneyTypeService } from './service/money-type.service';
import { InOutService } from './service/in-out.service';
import { AccountsService } from './service/accounts.service';
import { OrganizationsService } from './service/organizations.service';
import { CommoditiesService } from './service/commodities.service';
import { CommodityGroupsService } from './service/commodity-groups.service';
import { OrganizationGroupsService } from './service/organization-groups.service';
import { ExpenseItemsService } from './service/expense-items.service';
import { IncomeItemsService } from './service/income-items.service'
import { StatsService } from './service/stats.service'

import { ErrorDialogService } from './error/error-dialog.service';
import { GlobalErrorHandler } from './error/global-error-handler';
import { ErrorHandlerInterceptor } from './error/error-handler.interceptor';

import { PageSizeComponent } from './components/page-size/page-size.component';
import { EntityListComponent } from './components/entity-list/entity-list.component';
import { EntityListFilteredComponent } from './components/entity-list-filtered/entity-list-filtered.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { EntityElementComponent } from './components/entity-element/entity-element.component';
import { PaginationBarComponent } from './components/pagination-bar/pagination-bar.component';
import { MoneyTypeSelectorComponent } from './components/money-type-selector/money-type-selector.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { DateRangeSelectorComponent } from './components/date-range-selector/date-range-selector.component';
import { StatsTotalsComponentComponent } from './components/stats-totals/stats-totals-component.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatGridListModule,
    ContentLoaderModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  exports: [
    EntityElementComponent,
    BreadcrumbsComponent,
    EntityListComponent,
    EntityListFilteredComponent,
    MoneyTypeSelectorComponent,
    DateRangeSelectorComponent,
    StatsTotalsComponentComponent
  ],
  declarations: [
    EntityListComponent,
    BreadcrumbsComponent,
    EntityElementComponent,
    PaginationBarComponent,
    PageSizeComponent,
    EntityListFilteredComponent,
    ErrorDialogComponent,
    PageNotFoundComponent,
    MoneyTypeSelectorComponent,
    MoneyTypeSelectorComponent,
    DateRangeSelectorComponent,
    StatsTotalsComponentComponent
  ],
  providers: [
    AccountsService,
    OrganizationsService,
    CommoditiesService,
    CommodityGroupService,
    CommodityGroupsService,
    OrganizationGroupsService,
    ExpenseItemsService,
    IncomeItemsService,
    InOutService,
    LastCommodityService,
    MoneyExchangeService,
    MoneyTypeService,
    StatsService,
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
