import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { of } from 'rxjs';

import { MoneyTypeService } from './money-type.service';
import { EnvironmentService } from './environment.service';

describe('MoneyTypeService', () => {
  let service: MoneyTypeService;
  let mockHateoasService: jest.Mocked<HateoasResourceService>;

  beforeEach(() => {
    // Create a safe mock that simulates getting an empty page on preload
    mockHateoasService = {
      getPage: jest.fn().mockReturnValue(of({ resources: [] })),
    } as any;

    TestBed.configureTestingModule({
      imports: [
        // Use the standard testing module instead of exposing raw HttpHandlers
        HttpClientTestingModule,
      ],
      providers: [
        MoneyTypeService,
        // Swap out EnvironmentService if it tries to grab window config values
        { provide: EnvironmentService, useValue: { production: false } },
        // Inject the mock wrapper to protect the service constructor
        { provide: HateoasResourceService, useValue: mockHateoasService },
      ],
    });

    service = TestBed.inject(MoneyTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    // Verify that it attempted to automatically preload on spin up
    expect(mockHateoasService.getPage).toHaveBeenCalled();
  });
});
