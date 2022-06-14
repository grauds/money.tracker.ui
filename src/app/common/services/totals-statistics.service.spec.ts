import { TestBed } from '@angular/core/testing';

import { TotalsStatisticsService } from './totals-statistics.service';

describe('TotalsStatisticsService', () => {
  let service: TotalsStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotalsStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
