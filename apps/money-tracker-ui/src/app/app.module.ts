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

import { CommodityGroup, Commodity, ExpenseItem, Organization, UnitType } from '@clematis-shared/model';

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
import { EntityElementComponent } from './common/widgets/entity-element/entity-element.component';
import { PaginationBarComponent } from './common/widgets/pagination-bar/pagination-bar.component';

// lists
import { CommoditiesListComponent } from './commodities/commodities-list/commodities-list.component';
import { CommodityGroupListComponent } from './commodities/commodity-group-list/commodity-group-list.component';
import { OrganizationsListComponent } from './organizations/organizations-list/organizations-list.component';

// pages
import { CommoditiesComponent } from './pages/commodities/commodities.component';
import { CommoditiesGroupsComponent } from './pages/commodities-groups/commodities-groups.component';
import { OrganizationsComponent } from './pages/organizations/organizations.component';
import { ExpensesListComponent } from './pages/expences-list/expenses-list.component';
import { ExpenseItemRendererComponent } from './pages/expences-list/expense-item-renderer/expense-item-renderer.component';
import { PageSizeComponent } from './common/widgets/page-size/page-size.component';
import { SearchComponent } from './common/widgets/search/search.component';
import { CommodityComponent } from './commodities/commodity/commodity.component';
import { CommodityGroupComponent } from './commodities/commodity-group/commodity-group.component';

import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { AccountBalanceItemComponent } from './main/account-balance-item/account-balance-item.component';
import { OrganizationComponent } from './organizations/organization/organization.component';
import { OrganizationGroupComponent } from './organizations/organization-group/organization-group.component';
import { OrganizationGroupListComponent } from './organizations/organization-group-list/organization-group-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

PlotlyModule.plotlyjs = PlotlyJS;

const routes: Routes = [
  {
    path: 'commodities',
    component: CommoditiesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'commodities/:id',
    component: CommodityComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'commodityGroups',
    component: CommoditiesGroupsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'commodityGroups/:id',
    component: CommodityGroupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'expenses',
    component: ExpensesListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organizations',
    component: OrganizationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organizations/:id',
    component: OrganizationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organizationGroups',
    component: OrganizationGroupListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organizationGroups/:id',
    component: OrganizationGroupComponent,
    canActivate: [AuthGuard],
  },
  { path: '', component: MainComponent, canActivate: [AuthGuard] },
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
    EntityElementComponent,
    PaginationBarComponent,
    CommodityGroupListComponent,
    CommoditiesComponent,
    CommoditiesGroupsComponent,
    OrganizationsComponent,
    CommoditiesListComponent,
    OrganizationsListComponent,
    ExpensesListComponent,
    ExpenseItemRendererComponent,
    PageSizeComponent,
    SearchComponent,
    CommodityComponent,
    CommodityGroupComponent,
    AccountBalanceItemComponent,
    OrganizationComponent,
    OrganizationGroupComponent,
    OrganizationGroupListComponent
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
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    LayoutModule,
    MatPaginatorModule,
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
        rootUrl: environment.apiUrl,
      },
      useTypes: {
        resources: [
          CommodityGroup,
          Commodity,
          ExpenseItem,
          Organization,
          UnitType,
        ],
      },
    });
  }
}
