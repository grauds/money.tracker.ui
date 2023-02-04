import { TestBed } from '@angular/core/testing';

import { LastCommodityService } from './last-commodity.service';

describe('LastCommodityService', () => {
  let service: LastCommodityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastCommodityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
