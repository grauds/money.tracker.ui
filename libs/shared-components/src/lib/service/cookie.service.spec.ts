import { TestBed } from '@angular/core/testing';
import { CookieService } from "./cookie.service";
import Keycloak from 'keycloak-js';

describe('CookieService', () => {
  let service: CookieService;
  let mockKeycloakService: { idTokenParsed: { sub: string } | undefined };

  beforeEach(() => {
    // Exact structural representation of the keycloak-js root object instance
    mockKeycloakService = {
      idTokenParsed: { sub: 'user_12345_abc' }
    };

    TestBed.configureTestingModule({
      providers: [
        CookieService,
        { provide: Keycloak, useValue: mockKeycloakService }
      ]
    });

    service = TestBed.inject(CookieService);

    // Mock document cookie management tracking for isolated JSDOM environments
    let cookieStore = '';
    jest.spyOn(document, 'cookie', 'set')
      .mockImplementation((val) => {
      cookieStore = val;
    });
    jest.spyOn(document, 'cookie', 'get')
      .mockImplementation(() => cookieStore);
  });

  it('should isolate cookie keys using active Keycloak sub identifier profile values', () => {
    const samplePayload = { page: 1 };
    service.setState('dashboard', samplePayload);

    // Verify key cloak token prefix is merged perfectly into key string output
    expect(document.cookie).toContain('usr_user_12345_abc_dashboard=');

    const restored = service.getState('dashboard');
    expect(restored).toEqual(samplePayload);
  });

  it('should fallback cleanly to anonymous configuration if profile claims fail', () => {
    // Clear the direct field properties looked up by your getUserIdPrefix() method
    mockKeycloakService.idTokenParsed = undefined;

    service.setState('dashboard', { page: 0 });
    expect(document.cookie).toContain('usr_anonymous_dashboard=');
  });
});
