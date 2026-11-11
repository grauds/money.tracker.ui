import { TestBed } from '@angular/core/testing';

import { IncomeService } from './income.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ENVIRONMENT, EnvironmentService } from './environment.service';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';

describe('IncomeService', () => {
  let service: IncomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IncomeService,
        HttpClient,
        HttpHandler,
        EnvironmentService,
        HateoasResourceService,
        {
          provide: ENVIRONMENT,
          useValue: { apiUrl: 'http://localhost:8080/api' },
        },
      ],
    });
    service = TestBed.inject(IncomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
