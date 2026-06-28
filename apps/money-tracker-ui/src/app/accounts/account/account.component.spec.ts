import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountComponent } from './account.component';
import { ExpenseItemsService, IncomeItemsService, MoneyTypeService } from '@clematis-shared/shared-components';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { fakeActivatedRoute, mockHateoasService } from '../../../test-setup';
import { ActivatedRoute } from '@angular/router';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountComponent],
      providers: [
        ExpenseItemsService,
        IncomeItemsService,
        MoneyTypeService,
        { provide: HateoasResourceService, useValue: mockHateoasService },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
