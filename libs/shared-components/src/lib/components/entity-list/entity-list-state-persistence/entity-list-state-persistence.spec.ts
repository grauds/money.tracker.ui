import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { Sort as RestSort } from '@lagoshny/ngx-hateoas-client';

import { EntityListPersistenceService } from './entity-list-state-persistence';
import { CookieService } from '../../../service/cookie.service';
import { CookieStatePersistence } from '../cookie-state-persistence';
import { UrlStateAdapter } from '../url-state-adapter/url-state-adapter';


describe('EntityListPersistenceService', () => {
  let service: EntityListPersistenceService;
  let mockRouter: jest.Mocked<Pick<Router, 'navigate'>>;
  let mockCookieService: { get: jest.Mock; set: jest.Mock };

  let mockRoute: {
    snapshot: { queryParams: Record<string, string | undefined> };
  };


  beforeEach(() => {
    // Define clean Jest mock objects for dependencies
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    mockCookieService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    mockRoute = {
      snapshot: {
        queryParams: {},
      },
    };

    TestBed.configureTestingModule({
      providers: [
        EntityListPersistenceService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CookieService, useValue: mockCookieService },
      ],
    });

    service = TestBed.inject(EntityListPersistenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('configure', () => {
    it('should set internal properties and initialize CookieStatePersistence', () => {
      service.configure({
        cookieKey: 'test_key',
        updateRouterState: false,
        queryParamsMode: 'preserve',
      });

      // Verify property updates using typecasting for private properties
      expect(service['updateRouterState']).toBe(false);
      expect(service['queryParamsMode']).toBe('preserve');
      expect(service['cookiePersistence']).toBeInstanceOf(
        CookieStatePersistence,
      );
    });
  });

  describe('getInitialState', () => {
    beforeEach(() => {
      service.configure({
        cookieKey: 'test_key',
        updateRouterState: true,
        queryParamsMode: 'merge',
      });
    });

    it('should return URL state if updateRouterState is true and URL parameters match signature keys', () => {
      mockRoute.snapshot.queryParams = { page: '2', size: '20' };

      const mockParsedState = {
        n: 2,
        limit: 20,
        sort: null,
        filter: new Map(),
      };
      const parseParamsSpy = jest
        .spyOn(UrlStateAdapter, 'parseParams')
        .mockReturnValue(mockParsedState);

      const result = service.getInitialState();

      expect(parseParamsSpy).toHaveBeenCalledWith(
        mockRoute.snapshot.queryParams,
      );
      expect(result).toEqual(mockParsedState);
      parseParamsSpy.mockRestore(); // Clean up static spy
    });

    it('should fall back to Cookie state if URL parameters are completely missing', () => {
      mockRoute.snapshot.queryParams = {}; // Missing page or size keys

      const mockCookieState = {
        n: 5,
        limit: 50,
        sort: { name: 'DESC' } as RestSort,
        filter: [['key', 'val'] as [string, string]],
      };
      const loadStateSpy = jest
        .spyOn((service as any).cookiePersistence, 'loadState')
        .mockReturnValue(mockCookieState);

      const result = service.getInitialState();

      expect(loadStateSpy).toHaveBeenCalled();
      expect(result.n).toBe(5);
      expect(result.limit).toBe(50);
      expect(result.sort).toEqual({ name: 'DESC' });
      expect(result.filter.get('key')).toBe('val');
      loadStateSpy.mockRestore();
    });

    it('should fall back to baseline default values if both URL and Cookie states are empty', () => {
      mockRoute.snapshot.queryParams = {};
      const loadStateSpy = jest
        .spyOn((service as any).cookiePersistence, 'loadState')
        .mockReturnValue(null);

      const result = service.getInitialState();

      expect(result).toEqual({
        n: 0,
        limit: 10,
        sort: { name: 'ASC' },
        filter: new Map(),
      });
      loadStateSpy.mockRestore();
    });

    it('should bypass URL check and fall back straight to Cookie if updateRouterState configuration is false', () => {
      service.configure({
        cookieKey: 'test',
        updateRouterState: false,
        queryParamsMode: 'merge',
      });
      mockRoute.snapshot.queryParams = { page: '2', size: '20' }; // Values are present but ignored

      const loadStateSpy = jest
        .spyOn((service as any).cookiePersistence, 'loadState')
        .mockReturnValue(null);

      service.getInitialState();

      expect(loadStateSpy).toHaveBeenCalled();
      loadStateSpy.mockRestore();
    });
  });

  describe('saveState', () => {
    const dummyFilter = new Map<string, string>();

    it('should skip structural navigation and return true early if ongoing matching URL matches target params', async () => {
      service.configure({
        cookieKey: 'test',
        updateRouterState: true,
        queryParamsMode: 'merge',
      });

      // current active route state
      mockRoute.snapshot.queryParams = {
        page: '3',
        size: '30',
        sort: '', // explicitly set to match empty string defaults
      };

      // Make sure the spy returns target queryParams that perfectly match the active route state above
      const buildParamsSpy = jest
        .spyOn(UrlStateAdapter, 'buildRouteParameters')
        .mockReturnValue({
          queryParams: {
            page: '3',
            size: '30',
            sort: '',
          },
        });

      // Execute the function under test with matching pagination inputs
      const result = await service.saveState(3, 30, null, dummyFilter);

      // Assert early abort logic worked cleanly
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(result).toBe(true);

      buildParamsSpy.mockRestore();
    });

    it('should invoke router.navigate if target parameter payload differs from ongoing active URL parameters', async () => {
      service.configure({
        cookieKey: 'test',
        updateRouterState: true,
        queryParamsMode: 'merge',
      });
      mockRoute.snapshot.queryParams = { page: '1', size: '10' }; // Mismatching state triggering a change

      const mockExtras = {
        queryParams: { page: 4, size: 40 },
        queryParamsHandling: 'merge',
      };
      const buildParamsSpy = jest
        .spyOn(UrlStateAdapter, 'buildRouteParameters')
        .mockReturnValue(mockExtras as any);

      const result = await service.saveState(4, 40, null, dummyFilter);

      expect(buildParamsSpy).toHaveBeenCalledWith(
        4,
        40,
        null,
        dummyFilter,
        'merge',
        mockRoute,
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith([], mockExtras);
      expect(result).toBe(true);
      buildParamsSpy.mockRestore();
    });

    it('should cleanly push and commit data mutations to cookie instance if updateRouterState is false', async () => {
      service.configure({
        cookieKey: 'test',
        updateRouterState: false,
        queryParamsMode: 'merge',
      });

      const saveCookieSpy = jest
        .spyOn((service as any).cookiePersistence, 'saveState')
        .mockImplementation(() => {
          // nothing here
        });

      const result = await service.saveState(2, 20, null, dummyFilter);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(saveCookieSpy).toHaveBeenCalledWith(2, 20, null, dummyFilter);
      expect(result).toBe(true);
      saveCookieSpy.mockRestore();
    });
  });
});
