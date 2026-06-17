import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { MatPaginatorModule } from '@angular/material/paginator';

import {
  AccountsService,
  MoneyTypeService,
  SharedComponentsModule,
} from '@clematis-shared/shared-components';

import { BalanceComponent } from './balance.component';
import { NgxEchartsModule } from "ngx-echarts";
import { mockResizeObserver } from "../../../mocks/mock_resize_observer";

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ id: 9 }),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    global.ResizeObserver = mockResizeObserver;

    await TestBed.configureTestingModule({
      declarations: [BalanceComponent],
      imports: [
        SharedComponentsModule,
        MatPaginatorModule,
        NgxEchartsModule.forRoot({
          echarts: () => import("echarts")
        })
      ],
      providers: [
        AccountsService,
        HttpClient,
        HttpHandler,
        MoneyTypeService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },

      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
