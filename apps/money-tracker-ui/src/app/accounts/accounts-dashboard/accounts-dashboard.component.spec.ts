import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsDashboardComponent } from './accounts-dashboard.component';
import { AccountsService, MoneyTypeService } from "@clematis-shared/shared-components";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { KeycloakService } from "keycloak-angular";
import { of } from "rxjs";
import { ActivatedRoute, convertToParamMap } from "@angular/router";

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
