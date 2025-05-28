import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { DateRangeSelectorComponent } from './date-range-selector.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('DateRangeSelectorComponent', () => {
  let component: DateRangeSelectorComponent;
  let fixture: ComponentFixture<DateRangeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule
      ],
      declarations: [DateRangeSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
