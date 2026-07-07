import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityGroupComponent } from './commodity-group.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import {
  CommodityGroupService,
  CommodityGroupsService, MoneyTypeService
} from '@clematis-shared/shared-components';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { fakeActivatedRoute, mockMoneyTypeService } from '../../../test-setup';

describe('CommodityGroupComponent', () => {
  let component: CommodityGroupComponent;
  let fixture: ComponentFixture<CommodityGroupComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ id: 9 }),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommodityGroupComponent],
      providers: [
        HttpClient,
        HttpHandler,
        CommodityGroupService,
        CommodityGroupsService,
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommodityGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
