import { TestBed } from '@angular/core/testing';
import { CookieService } from './cookie.service';
import Keycloak from 'keycloak-js';

describe('CookieService', () => {
  let service: CookieService;
  let mockKeycloakService: { idTokenParsed: { sub: string } | undefined };
  let localStorageStore: Record<string, string>;

  beforeEach(() => {
    // Exact structural representation of the keycloak-js root object instance
    mockKeycloakService = {
      idTokenParsed: { sub: 'user_12345_abc' },
    };

    TestBed.configureTestingModule({
      providers: [
        CookieService,
        { provide: Keycloak, useValue: mockKeycloakService },
      ],
    });

    service = TestBed.inject(CookieService);

    // Mock localStorage tracking for isolated JSDOM testing environments
    localStorageStore = {};

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => {
      localStorageStore[key] = val;
    });

    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      return localStorageStore[key] || null;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should isolate storage keys using active Keycloak sub identifier profile values', () => {
    const samplePayload = { page: 1 };
    service.setState('dashboard', samplePayload);

    // Verify keycloak token prefix is merged perfectly into storage keys
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'usr_user_12345_abc_dashboard',
      expect.any(String),
    );

    const restored = service.getState('dashboard');
    expect(restored).toEqual(samplePayload);
  });

  it('should fallback cleanly to anonymous configuration if profile claims fail', () => {
    // Clear the direct field properties looked up by your getUserIdPrefix() method
    mockKeycloakService.idTokenParsed = undefined;

    service.setState('dashboard', { page: 0 });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'usr_anonymous_dashboard',
      expect.any(String),
    );
  });
});
