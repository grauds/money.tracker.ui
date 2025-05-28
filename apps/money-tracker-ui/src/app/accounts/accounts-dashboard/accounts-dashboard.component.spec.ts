import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';


import { of } from 'rxjs';

import { AccountsDashboardComponent } from './accounts-dashboard.component';
import {
  AccountsService,
  MoneyTypeService,
  SharedComponentsModule,
} from '@clematis-shared/shared-components';
import { mockResizeObserver } from '../../../mocks/mock_resize_observer';


describe('AccountsDashboardComponent', () => {
  let component: AccountsDashboardComponent;
  let fixture: ComponentFixture<AccountsDashboardComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({}),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    global.ResizeObserver = mockResizeObserver;

    await TestBed.configureTestingModule({
      declarations: [AccountsDashboardComponent],
      imports: [
        SharedComponentsModule,
        BrowserAnimationsModule,
        MatCheckboxModule,
        FormsModule,
        NgxEchartsModule.forRoot({
          echarts: () => import("echarts")
        }),
      ],
      providers: [
        AccountsService,
        HttpClient,
        HttpHandler,
        MoneyTypeService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
