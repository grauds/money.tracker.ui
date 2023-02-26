import { TestBed } from '@angular/core/testing';

import { SearchService } from './search.service';
import { Resource } from "@lagoshny/ngx-hateoas-client";
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('SearchService', () => {
  let service: SearchService<Resource>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: SearchService, useValue: {  } },
        HttpClient,
        HttpHandler
      ]
    });
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
