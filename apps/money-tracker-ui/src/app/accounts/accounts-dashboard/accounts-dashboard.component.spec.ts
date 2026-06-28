import { CurrencyPipe } from "@angular/common";

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';

import { AccountsDashboardComponent } from './accounts-dashboard.component';
import {
  AccountsService,
  MoneyTypeService,
  SharedComponentsModule,
  CurrencySpacePipe
} from '@clematis-shared/shared-components';
import { mockResizeObserver } from '../../../mocks/mock_resize_observer';
import { fakeActivatedRoute, mockMoneyTypeService } from '../../../test-setup';


describe('AccountsDashboardComponent', () => {
  let component: AccountsDashboardComponent;
  let fixture: ComponentFixture<AccountsDashboardComponent>;

  beforeEach(async () => {
    global.ResizeObserver = mockResizeObserver;

    await TestBed.configureTestingModule({
      declarations: [AccountsDashboardComponent],
      imports: [
        SharedComponentsModule,
        MatCheckboxModule,
        FormsModule,
        CurrencySpacePipe,
        NgxEchartsModule.forRoot({
          echarts: () => import('echarts'),
        }),
      ],
      providers: [
        AccountsService,
        HttpClient,
        HttpHandler,
        MoneyTypeService,
        CurrencyPipe,
        CurrencySpacePipe,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: MoneyTypeService, useValue: mockMoneyTypeService },
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
