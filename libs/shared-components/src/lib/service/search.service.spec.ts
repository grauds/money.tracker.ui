import { TestBed } from '@angular/core/testing';

import { SearchService } from './search.service';
import { Resource } from "@lagoshny/ngx-hateoas-client";

describe('SearchService', () => {
  let service: SearchService<Resource>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
