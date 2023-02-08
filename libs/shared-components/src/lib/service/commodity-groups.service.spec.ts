import { TestBed } from '@angular/core/testing';

import { CommodityGroupsService } from './commodity-groups.service';

describe('CommodityGroupsService', () => {
  let service: CommodityGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommodityGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
