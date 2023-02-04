import { TestBed } from '@angular/core/testing';

import { HateoasService } from './hateoas.service';
import { Resource } from "@lagoshny/ngx-hateoas-client";

describe('HateoasService', () => {
  let service: HateoasService<Resource>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HateoasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
