import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import Keycloak from 'keycloak-js';
import { MockKeycloak } from '../../mocks/mock_keycloak';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';
import { signal } from '@angular/core';
import { isAccessAllowed, canActivate } from './auth.guard';

describe('AuthGuard', () => {
  let mockKeycloak: MockKeycloak;

  const createRoute = (data?: { role?: string }): ActivatedRouteSnapshot => {
    const route = {} as ActivatedRouteSnapshot;
    Object.defineProperty(route, 'data', {
      value: data || {},
      writable: false,
      configurable: true,
    });
    return route;
  };

  const createState = (url = '/test'): RouterStateSnapshot => {
    return { url } as RouterStateSnapshot;
  };

  beforeEach(() => {
    mockKeycloak = new MockKeycloak();
    mockKeycloak.authenticated = true;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: signal(null) },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should export canActivate as a function', () => {
    expect(canActivate).toBeDefined();
    expect(typeof canActivate).toBe('function');
  });

  it('should export isAccessAllowed as an async function', () => {
    const result = isAccessAllowed(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
      {} as never
    );
    expect(result).toBeInstanceOf(Promise);
  });

  describe('role-based access logic', () => {
    it('should return true when no required role is specified and authenticated', fakeAsync(() => {
      mockKeycloak.authenticated = true;
      mockKeycloak.updateToken = jest.fn().mockResolvedValue(true);

      const route = createRoute();
      const state = createState('/test');

      TestBed.runInInjectionContext(() => {
        const result = isAccessAllowed(
          route,
          state,
          {
            authenticated: true,
            grantedRoles: { resourceRoles: {} },
          } as never
        );

        tick();
        expect(result).resolves.toBe(true);
      });
    }));

    it('should return true when required role is in granted roles', fakeAsync(() => {
      mockKeycloak.authenticated = true;
      mockKeycloak.updateToken = jest.fn().mockResolvedValue(true);

      const route = createRoute({ role: 'admin' });
      const state = createState('/admin');

      TestBed.runInInjectionContext(() => {
        const result = isAccessAllowed(
          route,
          state,
          {
            authenticated: true,
            grantedRoles: {
              resourceRoles: {
                'my-app': ['admin', 'user'],
              },
            },
          } as never
        );

        tick();
        expect(result).resolves.toBe(true);
      });
    }));

    it('should return false when required role is not granted', fakeAsync(() => {
      mockKeycloak.authenticated = true;
      mockKeycloak.updateToken = jest.fn().mockResolvedValue(true);

      const route = createRoute({ role: 'superadmin' });
      const state = createState('/superadmin');

      TestBed.runInInjectionContext(() => {
        const result = isAccessAllowed(
          route,
          state,
          {
            authenticated: true,
            grantedRoles: {
              resourceRoles: {
                'my-app': ['admin', 'user'],
              },
            },
          } as never
        );

        tick();
        expect(result).resolves.toBe(false);
      });
    }));

    it('should handle multiple role resources', fakeAsync(() => {
      mockKeycloak.authenticated = true;
      mockKeycloak.updateToken = jest.fn().mockResolvedValue(true);

      const route = createRoute({ role: 'editor' });
      const state = createState('/editor');

      TestBed.runInInjectionContext(() => {
        const result = isAccessAllowed(
          route,
          state,
          {
            authenticated: true,
            grantedRoles: {
              resourceRoles: {
                'my-app': ['viewer'],
                'admin-app': ['editor', 'admin'],
              },
            },
          } as never
        );

        tick();
        expect(result).resolves.toBe(true);
      });
    }));

    it('should return true when role is empty string (treated as no role required)', fakeAsync(() => {
      mockKeycloak.authenticated = true;
      mockKeycloak.updateToken = jest.fn().mockResolvedValue(true);

      const route = createRoute({ role: '' } as never);
      const state = createState('/test');

      TestBed.runInInjectionContext(() => {
        const result = isAccessAllowed(
          route,
          state,
          {
            authenticated: true,
            grantedRoles: { resourceRoles: {} },
          } as never
        );

        tick();
        expect(result).resolves.toBe(true);
      });
    }));
  });

  describe('guard integration', () => {
    it('should create canActivate guard function via createAuthGuard', () => {
      expect(canActivate).toBeDefined();
      expect(typeof canActivate).toBe('function');
    });

    it('should have isAccessAllowed as exported async function', () => {
      expect(typeof isAccessAllowed).toBe('function');
    });
  });
});
