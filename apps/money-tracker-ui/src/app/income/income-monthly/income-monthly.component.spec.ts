import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomeMonthlyComponent } from './income-monthly.component';

describe('IncomeMonthlyComponent', () => {
  let component: IncomeMonthlyComponent;
  let fixture: ComponentFixture<IncomeMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncomeMonthlyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
