import { TestBed } from '@angular/core/testing';

import { MoneyExchangeService } from './money-exchange.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('MoneyExchangeService', () => {
  let service: MoneyExchangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MoneyExchangeService, HttpClient, HttpHandler],
    });
    service = TestBed.inject(MoneyExchangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
