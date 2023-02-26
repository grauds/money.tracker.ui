import { TestBed } from '@angular/core/testing';

import { InOutService } from './in-out.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('InOutService', () => {
  let service: InOutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InOutService, HttpClient, HttpHandler]
    });
    service = TestBed.inject(InOutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
