import { TestBed } from '@angular/core/testing';

import { CommoditiesService } from './commodities.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('CommoditiesService', () => {
  let service: CommoditiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommoditiesService, HttpClient, HttpHandler]
    });
    service = TestBed.inject(CommoditiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
