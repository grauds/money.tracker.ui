import { TestBed } from '@angular/core/testing';

import { LastCommodityService } from './last-commodity.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('LastCommodityService', () => {
  let service: LastCommodityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LastCommodityService, HttpClient, HttpHandler],
    });
    service = TestBed.inject(LastCommodityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
