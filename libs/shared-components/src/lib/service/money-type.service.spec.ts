import { TestBed } from '@angular/core/testing';

import { MoneyTypeService } from './money-type.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('MoneyTypeService', () => {
  let service: MoneyTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MoneyTypeService, HttpClient, HttpHandler]
    });
    service = TestBed.inject(MoneyTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
