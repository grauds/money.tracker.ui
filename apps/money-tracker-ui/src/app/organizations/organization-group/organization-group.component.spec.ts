import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationGroupComponent } from './organization-group.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MoneyTypeService, OrganizationGroupsService } from '@clematis-shared/shared-components';
import { ActivatedRoute } from '@angular/router';
import { fakeActivatedRoute, mockMoneyTypeService } from '../../../test-setup';
import { of } from 'rxjs';

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
        {
          provide: ActivatedRoute,
          useValue: {
            ...fakeActivatedRoute,
            paramMap: of({
              // Add the missing paramMap observable
              get: (key: string) => 'mock-id',
              has: (key: string) => true,
            }),
          },
        },
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
