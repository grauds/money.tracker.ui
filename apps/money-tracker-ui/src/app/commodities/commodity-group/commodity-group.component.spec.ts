import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityGroupComponent } from './commodity-group.component';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { CommodityGroupService, CommodityGroupsService } from "@clematis-shared/shared-components";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { of } from "rxjs";

describe('CommodityGroupComponent', () => {
  let component: CommodityGroupComponent;
  let fixture: ComponentFixture<CommodityGroupComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ 'id': 9})
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommodityGroupComponent ],
      providers: [
        HttpClient,
        HttpHandler,
        CommodityGroupService,
        CommodityGroupsService,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    })
    .compileComponents();
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
