import { TestBed } from '@angular/core/testing';

import { OrganizationGroupsService } from './organization-groups.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('OrganizationGroupsService', () => {
  let service: OrganizationGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizationGroupsService, HttpClient, HttpHandler]
    });
    service = TestBed.inject(OrganizationGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
