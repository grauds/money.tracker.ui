import { TestBed } from '@angular/core/testing';

import { CommodityGroupService } from './commodity-group.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('CommodityGroupService', () => {
  let service: CommodityGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommodityGroupService, HttpClient, HttpHandler]
    });
    service = TestBed.inject(CommodityGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
