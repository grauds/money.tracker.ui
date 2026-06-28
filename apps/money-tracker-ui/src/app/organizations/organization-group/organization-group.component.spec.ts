import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationGroupComponent } from './organization-group.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MoneyTypeService, OrganizationGroupsService } from '@clematis-shared/shared-components';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { fakeActivatedRoute, mockMoneyTypeService } from '../../../test-setup';

describe('OrganizationGroupComponent', () => {
  let component: OrganizationGroupComponent;
  let fixture: ComponentFixture<OrganizationGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationGroupComponent],
      providers: [
        HttpClient,
        HttpHandler,
        OrganizationGroupsService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: MoneyTypeService, useValue: mockMoneyTypeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
