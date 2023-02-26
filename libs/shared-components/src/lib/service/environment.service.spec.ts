import { TestBed } from '@angular/core/testing';

import { EnvironmentService } from './environment.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironmentService, HttpClient, HttpHandler]
    });
    service = TestBed.inject(EnvironmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
