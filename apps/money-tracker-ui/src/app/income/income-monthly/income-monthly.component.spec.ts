import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomeMonthlyComponent } from './income-monthly.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import {
  IncomeItemsService,
  MoneyTypeService,
} from '@clematis-shared/shared-components';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

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
    await TestBed.configureTestingModule({
      declarations: [IncomeMonthlyComponent],
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
