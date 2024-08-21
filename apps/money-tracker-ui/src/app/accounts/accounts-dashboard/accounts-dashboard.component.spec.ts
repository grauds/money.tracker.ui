import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { MatCheckboxModule } from '@angular/material/checkbox';

import { KeycloakService } from "keycloak-angular";
import { of } from "rxjs";

import { AccountsDashboardComponent } from './accounts-dashboard.component';
import { AccountsService, MoneyTypeService, SharedComponentsModule } from "@clematis-shared/shared-components";

describe('AccountsDashboardComponent', () => {
  let component: AccountsDashboardComponent;
  let fixture: ComponentFixture<AccountsDashboardComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ })      
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountsDashboardComponent],
      imports: [
        SharedComponentsModule,
        BrowserAnimationsModule,
        MatCheckboxModule
      ],
      providers: [
        AccountsService,
        HttpClient,
        HttpHandler,
        KeycloakService,
        MoneyTypeService,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
