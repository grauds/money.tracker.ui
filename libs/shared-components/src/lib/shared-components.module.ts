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
import { MatGridListModule } from '@angular/material/grid-list';

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
import { IncomeItemsService } from './service/income-items.service';
import { StatsService } from './service/stats.service';
import { EntityService } from './service/entity.service';

import { ErrorDialogService } from './error/error-dialog/error-dialog.service';
import { GlobalErrorHandler } from './error/global-error-handler';
import { ErrorHandlerInterceptor } from './error/error-handler.interceptor';

import { PageSizeComponent } from './components/page-size/page-size.component';
import { EntityListComponent } from './components/entity-list/entity-list.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { EntityElementComponent } from './components/entity-list/entity-element/entity-element.component';
import { PaginationBarComponent } from './components/pagination-bar/pagination-bar.component';
import { MoneyTypeSelectorComponent } from './components/money-type-selector/money-type-selector.component';
import { ErrorDialogComponent } from './error/error-dialog/error-dialog.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { DateRangeSelectorComponent } from './components/date-range-selector/date-range-selector.component';
import { StatsTotalsComponent } from './components/stats-totals/stats-totals.component';
import { ErrorMessageComponent } from "./error/error-message/error-message.component";
import { PhotoUploaderComponent } from "./components/photo-uploader/photo-uploader.component";
import { CurrencySpacePipe } from "./components/currency-space-pipe/currency-space-pipe";
import { EntityThumbnailComponent } from "./components/entity-list/entity-thumbnail/entity-thumbnail.component";
import { EntityNameFilterComponent } from "./components/entity-list/entity-name-filter/entity-name-filter.component";
import { EntityExpensesComponent } from "./components/entity/entity-expenses/entity-expenses.component";
import { EntityIncomeComponent } from "./components/entity/entity-income/entity-income.component";
import { NgxEchartsDirective } from 'ngx-echarts';

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
    ReactiveFormsModule,
    ErrorMessageComponent,
    PhotoUploaderComponent,
    CurrencySpacePipe,
    EntityThumbnailComponent,
    NgxEchartsDirective,
  ],
  exports: [
    EntityElementComponent,
    BreadcrumbsComponent,
    EntityListComponent,
    MoneyTypeSelectorComponent,
    DateRangeSelectorComponent,
    StatsTotalsComponent,
    PhotoUploaderComponent,
    EntityNameFilterComponent,
    EntityExpensesComponent,
    EntityIncomeComponent,
  ],
  declarations: [
    EntityListComponent,
    BreadcrumbsComponent,
    EntityElementComponent,
    PaginationBarComponent,
    PageSizeComponent,
    ErrorDialogComponent,
    PageNotFoundComponent,
    MoneyTypeSelectorComponent,
    DateRangeSelectorComponent,
    StatsTotalsComponent,
    EntityNameFilterComponent,
    EntityExpensesComponent,
    EntityIncomeComponent,
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
    EntityService,
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
