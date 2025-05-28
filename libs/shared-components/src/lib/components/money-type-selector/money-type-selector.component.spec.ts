import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelectModule } from '@angular/material/select';
import { MoneyTypeSelectorComponent } from './money-type-selector.component';

describe('MoneyTypeSelectorComponent', () => {
  let component: MoneyTypeSelectorComponent;
  let fixture: ComponentFixture<MoneyTypeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSelectModule],
      declarations: [MoneyTypeSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoneyTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
