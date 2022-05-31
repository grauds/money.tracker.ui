import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './init/keycloak-init.factory';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgxHateoasClientConfigurationService, NgxHateoasClientModule } from '@lagoshny/ngx-hateoas-client';
import { environment } from '../environments/environment';

import { SharedModule } from '../shared/shared.module';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth.guard';
import { HeaderComponent } from './header/header.component';
import { MainComponent } from './main/main.component';
import { CommodityGroup } from './common/model/commodity-group';
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
import { ExpensesListComponent } from './commodities/expences-list/expenses-list.component';
import {
  ExpenseItemRendererComponent
} from './commodities/expences-list/expense-item-renderer/expense-item-renderer.component';
import { Commodity } from './common/model/commodity';
import { ExpenseItem } from './common/model/expense-item';
import { Organization } from './common/model/organization';
import { PageSizeComponent } from './common/widgets/page-size/page-size.component';
import { SearchComponent } from './common/widgets/search/search.component';
import { CommodityComponent } from './commodities/commodity/commodity.component';

const routes: Routes = [{
    path: 'commodities',
    component: CommoditiesComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'commodities/:id',
    component: CommodityComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'commoditiesGroups',
    component: CommoditiesGroupsComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'expenses',
    component: ExpensesListComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'organizations',
    component: OrganizationsComponent,
    canActivate: [AuthGuard]
  },
  { path: '', component: MainComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: '' }
];

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
    CommodityComponent
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
    NgbModule,
    ContentLoaderModule,
    SharedModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
  }],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(hateoasConfig: NgxHateoasClientConfigurationService) {
    hateoasConfig.configure({
      http: {
        rootUrl: environment.apiUrl
      },
      useTypes: {
        resources: [CommodityGroup, Commodity, ExpenseItem, Organization]
      }
    });
  }
}
