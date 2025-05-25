import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';

import {
  SharedComponentsModule,
  ENVIRONMENT
} from '@clematis-shared/shared-components';

import { provideKeycloak } from 'keycloak-angular';

import { ContentLoaderModule } from '@ngneat/content-loader';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LayoutModule } from '@angular/cdk/layout';

import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxHateoasClientModule } from '@lagoshny/ngx-hateoas-client';
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
import { NgxEchartsModule } from 'ngx-echarts';

import { appRoutes as routes } from './routes';
import { AppComponentsModule } from "./app/app.module";

const mapConfig: YaConfig = {
  apikey: 'API_KEY',
  lang: 'en_US',
};

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(
      AngularYandexMapsModule.forRoot(mapConfig),
      ContentLoaderModule,
      FontAwesomeModule,
      FormsModule,
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
      NgxHateoasClientModule.forRoot(),
      NgxEchartsModule.forRoot({
        echarts: () => import('echarts'),
      }),
      ReactiveFormsModule,
      SharedComponentsModule,
      AppComponentsModule
    ),
    provideKeycloak({
      config: {
        url: environment.authUrl,
        realm: 'clematis',
        clientId: 'clematis-money-tracker-ui',
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/assets/silent-check-sso.html`
      }
    }),
    provideRouter(routes),
    {
      provide: ENVIRONMENT,
      useValue: environment,
    },
  ],
}).catch((err) => console.error(err));


