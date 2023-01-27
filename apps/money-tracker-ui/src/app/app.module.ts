import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { MockedKeycloakService } from './auth/mocked-keycloak.service';
import { initializeKeycloak } from './init/keycloak-init.factory';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { FormsModule } from '@angular/forms';
import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import { MatPaginatorModule } from '@angular/material/paginator';

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
import { environment } from '../environments/environment';

import { SharedModule } from '../shared/shared.module';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth.guard';
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

import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { NgxEchartsModule } from 'ngx-echarts';

import { OrganizationComponent } from './organizations/organization/organization.component';
import { OrganizationGroupComponent } from './organizations/organization-group/organization-group.component';
import { OrganizationGroupListComponent } from './organizations/organization-group-list/organization-group-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MoneyTrackerServiceModule } from '@clematis-shared/money-tracker-service';
import { WorkspaceComponent } from './workspace/workspace.component';
import { AboutComponent } from './about/about.component';
import { SharedComponentsModule } from '@clematis-shared/shared-components';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { AccountsDashboardComponent } from './accounts/accounts-dashboard/accounts-dashboard.component';
import { LastCommoditiesListComponent } from './expenses/last-commodities-list/last-commodities-list.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExchangeComponent } from './accounts/exchange/exchange.component';
import { ExchangeEventElementComponent } from './accounts/exchange-event-element/exchange-event-element.component';
import { MatButtonToggleModule } from "@angular/material/button-toggle";

PlotlyModule.plotlyjs = PlotlyJS;

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/about',
  },
  {
    path: 'about',
    pathMatch: 'full',
    component: AboutComponent,
  },
  {
    path: 'main',
    canActivate: [AuthGuard],
    component: MainComponent,
  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: WorkspaceComponent,
    children: [
      {
        path: 'accounts',
        component: AccountsDashboardComponent,
        pathMatch: 'full',
      },
      {
        path: 'commodities/:id',
        component: CommodityComponent,
      },
      {
        path: 'commodities',
        component: CommoditiesListComponent,
        pathMatch: 'full',
      },
      {
        path: 'commodityGroups',
        component: CommodityGroupListComponent,
        pathMatch: 'full',
      },
      {
        path: 'lastCommodities',
        component: LastCommoditiesListComponent,
        pathMatch: 'full',
      },
      {
        path: 'commodityGroups/:id',
        component: CommodityGroupComponent,
      },
      {
        path: 'expenses',
        component: ExpensesListComponent,
      },
      {
        path: 'exchange',
        component: ExchangeComponent,
      },
      {
        path: 'organizations',
        component: OrganizationsListComponent,
        pathMatch: 'full',
      },
      {
        path: 'organizations/:id',
        component: OrganizationComponent,
      },
      {
        path: 'organizationGroups',
        component: OrganizationGroupListComponent,
        pathMatch: 'full',
      },
      {
        path: 'organizationGroups/:id',
        component: OrganizationGroupComponent,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

const mapConfig: YaConfig = {
  apikey: 'API_KEY',
  lang: 'en_US',
};

@NgModule({
  declarations: [
    AppComponent,
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
  ],
    imports: [
        HttpClientModule,
        BrowserModule,
        FontAwesomeModule,
        KeycloakAngularModule,
        RouterModule.forRoot(
            routes,
            {enableTracing: true} // <-- debugging purposes only
        ),
        NgxHateoasClientModule.forRoot(),
        ContentLoaderModule,
        SharedModule,
        FormsModule,
        AngularYandexMapsModule.forRoot(mapConfig),
        PlotlyModule,
        NgxEchartsModule.forRoot({
            echarts: () => import('echarts'),
        }),
        BrowserAnimationsModule,
        MatToolbarModule,
        MatSidenavModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        LayoutModule,
        MatPaginatorModule,
        MoneyTrackerServiceModule,
        SharedComponentsModule,
        MatTableModule,
        MatGridListModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatButtonToggleModule,
    ],
  providers: [
    {
      provide: KeycloakService,
      useClass: KeycloakService,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(hateoasConfig: NgxHateoasClientConfigurationService) {
    hateoasConfig.configure({
      http: {
        defaultRoute: {
          rootUrl: environment.apiUrl,
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
