import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationGroupComponent } from './organization-group.component';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { OrganizationGroupsService } from "@clematis-shared/shared-components";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { of } from "rxjs";

describe('OrganizationGroupComponent', () => {
  let component: OrganizationGroupComponent;
  let fixture: ComponentFixture<OrganizationGroupComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ 'id': 9})
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationGroupComponent],
      providers: [
        HttpClient,
        HttpHandler,
        OrganizationGroupsService,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
