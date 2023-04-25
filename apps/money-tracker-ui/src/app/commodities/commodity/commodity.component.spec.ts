import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityComponent } from './commodity.component';
import { HttpClient, HttpHandler } from "@angular/common/http";
import {
  CommoditiesService,
  CommodityGroupService,
  CommodityGroupsService,
  ExpenseItemsService
} from "@clematis-shared/shared-components";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { of } from "rxjs";

describe('CommodityComponent', () => {
  let component: CommodityComponent;
  let fixture: ComponentFixture<CommodityComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ 'id': 9})
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommodityComponent ],
      providers: [
        HttpClient,
        HttpHandler,
        ExpenseItemsService,
        CommoditiesService,
        CommodityGroupService,
        CommodityGroupsService,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommodityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
