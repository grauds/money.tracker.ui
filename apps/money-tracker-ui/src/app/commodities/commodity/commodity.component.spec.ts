import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityComponent } from './commodity.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import {
  CommoditiesService,
  CommodityGroupService,
  CommodityGroupsService,
  ExpenseItemsService,
  SharedComponentsModule,
} from '@clematis-shared/shared-components';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { NgxEchartsModule } from "ngx-echarts";
import { mockResizeObserver } from "../../../mocks/mock_resize_observer";

describe('CommodityComponent', () => {
  let component: CommodityComponent;
  let fixture: ComponentFixture<CommodityComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ id: 9 }),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    global.ResizeObserver = mockResizeObserver;

    await TestBed.configureTestingModule({
      declarations: [CommodityComponent],
      imports: [
        SharedComponentsModule,
        NgxEchartsModule.forRoot({
          echarts: () => import("echarts")
        })
      ],
      providers: [
        HttpClient,
        HttpHandler,
        ExpenseItemsService,
        CommoditiesService,
        CommodityGroupService,
        CommodityGroupsService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommodityComponent);
    component = fixture.componentInstance;
    fixture.whenStable().then(() => {
      fixture.detectChanges();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
