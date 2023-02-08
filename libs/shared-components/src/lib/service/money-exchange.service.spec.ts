import { TestBed } from '@angular/core/testing';

import { MoneyExchangeService } from './money-exchange.service';

describe('MoneyExchangeService', () => {
  let service: MoneyExchangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoneyExchangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
