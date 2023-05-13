import { TestBed } from '@angular/core/testing';

import { IncomeItemsService } from './income-items.service';

describe('IncomeItemsService', () => {
  let service: IncomeItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomeItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
