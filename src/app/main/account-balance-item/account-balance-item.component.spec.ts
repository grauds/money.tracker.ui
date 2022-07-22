import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalanceItemComponent } from './account-balance-item.component';

describe('AccountBalanceItemComponent', () => {
  let component: AccountBalanceItemComponent;
  let fixture: ComponentFixture<AccountBalanceItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountBalanceItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBalanceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
