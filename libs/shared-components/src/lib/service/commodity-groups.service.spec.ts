import { TestBed } from '@angular/core/testing';

import { CommodityGroupsService } from './commodity-groups.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('CommodityGroupsService', () => {
  let service: CommodityGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommodityGroupsService, HttpClient, HttpHandler]
    });
    service = TestBed.inject(CommodityGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
