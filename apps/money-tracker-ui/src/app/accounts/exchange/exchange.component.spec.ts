import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeComponent } from './exchange.component';
import { KeycloakService } from "keycloak-angular";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { of } from "rxjs";

describe('ExchangeComponent', () => {
  let component: ExchangeComponent;
  let fixture: ComponentFixture<ExchangeComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ 'id': 9})
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExchangeComponent],
      providers: [
        HttpClient,
        HttpHandler,
        KeycloakService,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
