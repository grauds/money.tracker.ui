import { APP_INITIALIZER, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './init/keycloak-init.factory';
import { AuthGuard } from './auth/auth.guard';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { HeaderComponent } from './header/header.component';
import { MainComponent } from './main/main.component';
import { NgxHateoasClientConfigurationService, NgxHateoasClientModule } from '@lagoshny/ngx-hateoas-client';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CommodityGroup } from './common/model/commodity-group';
import { EntityElementComponent } from './common/widgets/entity-element/entity-element.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginationBarComponent } from './common/widgets/pagination-bar/pagination-bar.component';
import { CommodityGroupListComponent } from './commodities/groups/commodity-group-list/commodity-group-list.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  { path: '', component: MainComponent , canActivate: [AuthGuard]},
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainComponent,
    EntityElementComponent,
    PaginationBarComponent,
    CommodityGroupListComponent
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
    ContentLoaderModule
  ],
  providers: [{
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
        resources: [CommodityGroup]
      }
    });
  }
}
