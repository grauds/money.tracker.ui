import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountGroupAccountsComponent } from './account-group-accounts.component';

describe('AccountGroupAccountsComponent', () => {
  let component: AccountGroupAccountsComponent;
  let fixture: ComponentFixture<AccountGroupAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountGroupAccountsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountGroupAccountsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
