import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';

import {
  CommodityGroup,
  Commodity,
  ExpenseItem,
  Organization,
  UnitType,
  OrganizationGroup,
  Entity,
  MonthlyDelta,
  AccountBalance,
  MoneyExchange,
  MoneyType,
} from '@clematis-shared/model';

import {
  NgxHateoasClientConfigurationService,
  NgxHateoasClientModule,
} from '@lagoshny/ngx-hateoas-client';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MainComponent } from './main/main.component';

// lists
import { CommoditiesListComponent } from './commodities/commodities-list/commodities-list.component';
import { CommodityGroupListComponent } from './commodities/commodity-group-list/commodity-group-list.component';
import { OrganizationsListComponent } from './organizations/organizations-list/organizations-list.component';

// pages
import { ExpensesListComponent } from './expenses/expences-list/expenses-list.component';
import { CommodityComponent } from './commodities/commodity/commodity.component';
import { CommodityGroupComponent } from './commodities/commodity-group/commodity-group.component';

import { NgxEchartsModule } from 'ngx-echarts';

import { OrganizationComponent } from './organizations/organization/organization.component';
import { OrganizationGroupComponent } from './organizations/organization-group/organization-group.component';
import { OrganizationGroupListComponent } from './organizations/organization-group-list/organization-group-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WorkspaceComponent } from './workspace/workspace.component';
import { AboutComponent } from './about/about.component';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import {
  EnvironmentService,
  SharedComponentsModule,
} from '@clematis-shared/shared-components';

import { AccountsDashboardComponent } from './accounts/accounts-dashboard/accounts-dashboard.component';
import { LastCommoditiesListComponent } from './expenses/last-commodities-list/last-commodities-list.component';
import { ExchangeComponent } from './accounts/exchange/exchange.component';
import { ExchangeEventElementComponent } from './accounts/exchange-event-element/exchange-event-element.component';
import { InOutListComponent } from './expenses/in-out-list/in-out-list.component';
import { BalanceComponent } from './expenses/balance/balance.component';
import { CommodityGroupCommoditiesComponent } from './commodities/commodity-group-commodities/commodity-group-commodities.component';
import { OrganizationGroupOrganizationsComponent } from './organizations/organization-group-organizations/organization-group-organizations.component';
import { IncomeMonthlyComponent } from './income/income-monthly/income-monthly.component';
import { AgentCommoditiesComponent } from './expenses/agent-commodities/agent-commodities.component';
import { AngularYandexMapsModule } from "angular8-yandex-maps";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    HeaderComponent,
    MainComponent,
    CommodityGroupListComponent,
    CommoditiesListComponent,
    OrganizationsListComponent,
    ExpensesListComponent,
    CommodityComponent,
    CommodityGroupComponent,
    OrganizationComponent,
    OrganizationGroupComponent,
    OrganizationGroupListComponent,
    WorkspaceComponent,
    AboutComponent,
    AccountsDashboardComponent,
    LastCommoditiesListComponent,
    ExchangeComponent,
    ExchangeEventElementComponent,
    InOutListComponent,
    BalanceComponent,
    CommodityGroupCommoditiesComponent,
    OrganizationGroupOrganizationsComponent,
    IncomeMonthlyComponent,
    AgentCommoditiesComponent
  ],
  imports: [
    HttpClientModule,
    AngularYandexMapsModule,
    CommonModule,
    ContentLoaderModule,
    FontAwesomeModule,
    FormsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import("echarts")
    }),
    NgxHateoasClientModule.forRoot(),
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatGridListModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatSortModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatProgressBarModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive
  ],
  exports: [
    HeaderComponent
  ],
  providers: []
})
export class AppModule {
  constructor(
    hateoasConfig: NgxHateoasClientConfigurationService,
    environmentService: EnvironmentService
  ) {
    hateoasConfig.configure({
      http: {
        defaultRoute: {
          rootUrl: environmentService.getValue('apiUrl'),
        },
      },
      useTypes: {
        resources: [
          AccountBalance,
          Entity,
          CommodityGroup,
          Commodity,
          MoneyExchange,
          MoneyType,
          MonthlyDelta,
          OrganizationGroup,
          Organization,
          ExpenseItem,
          UnitType,
        ],
      },
    });
  }
}

export class AppComponentsModule {}
