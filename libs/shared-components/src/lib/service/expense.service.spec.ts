import { TestBed } from '@angular/core/testing';

import { ExpenseService } from './expense.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ENVIRONMENT, EnvironmentService } from './environment.service';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExpenseService,
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
    service = TestBed.inject(ExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
