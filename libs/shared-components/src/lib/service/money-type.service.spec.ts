import { TestBed } from '@angular/core/testing';

import { MoneyTypeService } from './money-type.service';

describe('MoneyTypeService', () => {
  let service: MoneyTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoneyTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
