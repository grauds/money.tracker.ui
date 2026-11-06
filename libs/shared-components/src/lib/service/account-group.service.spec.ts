import { TestBed } from '@angular/core/testing';
import { AccountGroupService } from './account-group.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import {
  HateoasResourceService,
  ResourceCollection,
} from '@lagoshny/ngx-hateoas-client';
import { AccountGroup, MoneyType } from '@clematis-shared/model';
import { EnvironmentService } from './environment.service';
import { of } from 'rxjs';

// Mock HateoasResourceService
class MockHateoasResourceService {
  searchPage = jest.fn().mockReturnValue(of({ resources: [], totalElements: 0 }));
  getPage = jest.fn().mockReturnValue(of({ resources: [], totalElements: 0 }));
  searchCollection = jest.fn().mockReturnValue(of(new ResourceCollection()));
}

describe('AccountGroupService', () => {
  let service: AccountGroupService;
  let mockHateoasService: MockHateoasResourceService;

  const mockEnvService = {
    getValue: jest.fn((key: string) => {
      if (key === 'apiUrl') return 'http://api.example.com';
      return '';
    }),
  } as unknown as jest.Mocked<EnvironmentService>;

  beforeEach(() => {
    mockHateoasService = new MockHateoasResourceService();

    TestBed.configureTestingModule({
      providers: [
        AccountGroupService,
        HttpClient,
        HttpHandler,
        { provide: HateoasResourceService, useValue: mockHateoasService },
        { provide: EnvironmentService, useValue: mockEnvService },
      ],
    });

    service = TestBed.inject(AccountGroupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#searchPage', () => {
    it('should delegate to hateoasService.searchPage', (done) => {
      const options = { pageParams: { size: 10, page: 0 } };
      const queryName = 'findAll';

      service.searchPage(options, queryName).subscribe((result) => {
        expect(mockHateoasService.searchPage).toHaveBeenCalledWith(
          AccountGroup,
          queryName,
          options
        );
        expect(result).toBeDefined();
        done();
      });
    });
  });

  describe('#getPage', () => {
    it('should delegate to hateoasService.getPage', (done) => {
      const options = { pageParams: { size: 20 } };

      service.getPage(options).subscribe((result) => {
        expect(mockHateoasService.getPage).toHaveBeenCalledWith(
          AccountGroup,
          options
        );
        expect(result).toBeDefined();
        done();
      });
    });
  });

  describe('#getPath', () => {
    it('should call searchCollection with pathById when accountGroupId is provided', (done) => {
      const accountGroupId = '123';

      service.getPath(accountGroupId).subscribe((result) => {
        expect(mockHateoasService.searchCollection).toHaveBeenCalledWith(
          AccountGroup,
          'pathById',
          { params: { id: accountGroupId } }
        );
        expect(result).toBeInstanceOf(ResourceCollection);
        done();
      });
    });

    it('should return empty ResourceCollection when accountGroupId is null', (done) => {
      service.getPath(null).subscribe((result) => {
        expect(result).toBeInstanceOf(ResourceCollection);
        expect(mockHateoasService.searchCollection).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return empty ResourceCollection when accountGroupId is undefined', (done) => {
      service.getPath(undefined as any).subscribe((result) => {
        expect(result).toBeInstanceOf(ResourceCollection);
        expect(mockHateoasService.searchCollection).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return empty ResourceCollection when accountGroupId is empty string', (done) => {
      service.getPath('').subscribe((result) => {
        expect(result).toBeInstanceOf(ResourceCollection);
        expect(mockHateoasService.searchCollection).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('#getTotals', () => {
    it('should return 0 when accountGroupId is null', (done) => {
      const moneyCode = new MoneyType();
      moneyCode.code = 'USD';

      service.getTotals(null, moneyCode).subscribe((total) => {
        expect(total).toBe(0);
        done();
      });
    });

    it('should return 0 when accountGroupId is empty string', (done) => {
      const moneyCode = new MoneyType();
      moneyCode.code = 'EUR';

      service.getTotals('', moneyCode).subscribe((total) => {
        expect(total).toBe(0);
        done();
      });
    });
  });
});
