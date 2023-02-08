import { TestBed } from '@angular/core/testing';

import { OrganizationGroupsService } from './organization-groups.service';

describe('OrganizationGroupsService', () => {
  let service: OrganizationGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
