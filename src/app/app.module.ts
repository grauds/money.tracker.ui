import { APP_INITIALIZER, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './init/keycloak-init.factory';
import { AuthGuard } from './auth/auth.guard';
import { HeaderComponent } from './header/header.component';
import { MainComponent } from './main/main.component';
import { NgxHateoasClientConfigurationService, NgxHateoasClientModule } from '@lagoshny/ngx-hateoas-client';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CommodityGroup } from './model/commodity-group';

const routes: Routes = [
  { path: '', component: MainComponent , canActivate: [AuthGuard]},
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    KeycloakAngularModule,
    RouterModule.forRoot(
      routes,
      {enableTracing: true} // <-- debugging purposes only
    ),
    NgxHateoasClientModule.forRoot()
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
