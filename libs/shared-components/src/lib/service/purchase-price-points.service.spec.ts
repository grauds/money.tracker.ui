import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { PurchasePricePointsService } from './purchase-price-points.service';

describe('PurchasePricePointsService', () => {
  let service: PurchasePricePointsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PurchasePricePointsService, HttpClient, HttpHandler],
    });
    service = TestBed.inject(PurchasePricePointsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
