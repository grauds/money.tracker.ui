import { TestBed } from '@angular/core/testing';

import { CommodityGroupService } from './commodity-group.service';

describe('CommodityGroupService', () => {
  let service: CommodityGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommodityGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
