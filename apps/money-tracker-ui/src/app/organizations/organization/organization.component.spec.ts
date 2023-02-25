import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationComponent } from './organization.component';
import { HttpClient, HttpHandler } from "@angular/common/http";
import {
  ExpenseItemsService,
  OrganizationGroupsService,
  OrganizationsService
} from "@clematis-shared/shared-components";
import { ActivatedRoute, convertToParamMap } from "@angular/router";

describe('OrganizationComponent', () => {
  let component: OrganizationComponent;
  let fixture: ComponentFixture<OrganizationComponent>;

  const fakeActivatedRoute = {
    snapshot: { paramMap: convertToParamMap({ 'id': 9}) }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationComponent],
      providers: [
        HttpClient,
        HttpHandler,
        ExpenseItemsService,
        OrganizationsService,
        OrganizationGroupsService,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
