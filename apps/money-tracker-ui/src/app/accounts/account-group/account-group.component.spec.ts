import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountGroupComponent } from './account-group.component';
import { MoneyTypeService } from '@clematis-shared/shared-components';
import { ActivatedRoute } from '@angular/router';

import { fakeActivatedRoute, mockMoneyTypeService } from '../../../test-setup';

describe('AccountGroupComponent', () => {
  let component: AccountGroupComponent;
  let fixture: ComponentFixture<AccountGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountGroupComponent],
      providers: [
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: MoneyTypeService, useValue: mockMoneyTypeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountGroupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
