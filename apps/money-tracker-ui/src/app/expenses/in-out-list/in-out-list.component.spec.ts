import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutListComponent } from './in-out-list.component';
import { InOutService, MoneyTypeService } from "@clematis-shared/shared-components";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { KeycloakService } from "keycloak-angular";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { MediaMatcher } from "@angular/cdk/layout";
import { of } from "rxjs";

const fakeActivatedRoute = {
  queryParams: of({}),
  snapshot: {
    paramMap: convertToParamMap({ 'id': 9})
  }
} as ActivatedRoute;

describe('InOutListComponent', () => {
  let component: InOutListComponent;
  let fixture: ComponentFixture<InOutListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InOutListComponent],
      providers: [
        InOutService,
        HttpClient,
        HttpHandler,
        KeycloakService,
        MediaMatcher,
        MoneyTypeService,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InOutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
