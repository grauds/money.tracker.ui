import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseItemRendererComponent } from './expense-item-renderer.component';

describe('ExpenseItemRendererComponent', () => {
  let component: ExpenseItemRendererComponent;
  let fixture: ComponentFixture<ExpenseItemRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpenseItemRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseItemRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
