import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from "rxjs";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { ActivatedRoute, convertToParamMap } from "@angular/router";

import { KeycloakService } from "keycloak-angular";
import { AccountsService, MoneyTypeService } from "@clematis-shared/shared-components";

import { BalanceComponent } from './balance.component';

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
        paramMap: convertToParamMap({ 'id': 9})
      }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BalanceComponent],
      providers: [
        AccountsService,
        HttpClient,
        HttpHandler,
        KeycloakService,
        MoneyTypeService,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
