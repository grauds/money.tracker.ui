import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';

import { EntityBalanceInfoComponent } from './entity-balance-info.component';
import { CurrencySpacePipe } from '../../currency-space-pipe/currency-space-pipe';

describe('EntityBalanceInfoComponent', () => {
  let component: EntityBalanceInfoComponent;
  let fixture: ComponentFixture<EntityBalanceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityBalanceInfoComponent],
      imports: [CurrencySpacePipe],
      providers: [CurrencyPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityBalanceInfoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
