import { TestBed } from '@angular/core/testing';

import { OrganizationsService } from './organizations.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizationsService, HttpClient, HttpHandler],
    });
    service = TestBed.inject(OrganizationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
