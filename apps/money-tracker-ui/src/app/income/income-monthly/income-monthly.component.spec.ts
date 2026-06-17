import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import {
  IncomeItemsService,
  MoneyTypeService,
} from '@clematis-shared/shared-components';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { SharedComponentsModule } from '@clematis-shared/shared-components';
import { IncomeMonthlyComponent } from './income-monthly.component';
import { NgxEchartsModule } from "ngx-echarts";
import { mockResizeObserver } from "../../../mocks/mock_resize_observer";

describe('IncomeMonthlyComponent', () => {
  let component: IncomeMonthlyComponent;
  let fixture: ComponentFixture<IncomeMonthlyComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({}),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    global.ResizeObserver = mockResizeObserver;

    await TestBed.configureTestingModule({
      declarations: [IncomeMonthlyComponent],
      imports: [
        SharedComponentsModule,
        NgxEchartsModule.forRoot({
          echarts: () => import("echarts")
        }),
      ],
      providers: [
        HttpClient,
        HttpHandler,
        MoneyTypeService,
        IncomeItemsService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },

      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
