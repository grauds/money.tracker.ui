import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomeMonthlyComponent } from './income-monthly.component';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { MoneyTypeService } from "@clematis-shared/shared-components";

describe('IncomeMonthlyComponent', () => {
  let component: IncomeMonthlyComponent;
  let fixture: ComponentFixture<IncomeMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncomeMonthlyComponent],
      providers: [
        HttpClient,
        HttpHandler,
        MoneyTypeService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
