/// <reference types="jest" />
//import 'jest-preset-angular/setup-jest';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
/**
 * The global mock for images
 */
if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
}
/**
 *
 */
setupZoneTestEnv();
/**
 * A global mock object representing a simplified Keycloak instance for testing purposes.
 * This mock object contains a minimally populated `idTokenParsed` property.
 *
 * Properties:
 * - `idTokenParsed`: An object representing the parsed ID token from the mocked Keycloak instance.
 *   - Contains the `sub` field, which represents the mocked user ID.
 *
 * Use this for scenarios where interacting with an authentication system like
 * Keycloak is required in a non-production environment.
 */
const globalMockKeycloak = {
  idTokenParsed: { sub: 'mock-global-user-id' },
};

// Intercept all module configurations globally
const originalConfigureTestingModule = TestBed.configureTestingModule;
TestBed.configureTestingModule = function (moduleDef) {
  moduleDef.providers = moduleDef.providers || [];

  // Only inject the mock if the user hasn't explicitly overwritten it inside their local spec file
  const hasKeycloakProvider = moduleDef.providers.some(
    (p) =>
      p === Keycloak ||
      (typeof p === 'object' &&
        p !== null &&
        'provide' in p &&
        p.provide === Keycloak),
  );

  if (!hasKeycloakProvider) {
    moduleDef.providers.push({
      provide: Keycloak,
      useValue: globalMockKeycloak,
    });
  }

  return originalConfigureTestingModule.call(this, moduleDef);
};

export const mockHateoasService = {
  searchPage: jest.fn().mockReturnValue(of({ resources: [] })),
  getPage: jest.fn().mockReturnValue(of({ resources: [] })),
  searchCollection: jest.fn().mockReturnValue(of({ resources: [] })),
};

export const mockMoneyTypeService = {
  preloadMoneyTypes: jest.fn().mockReturnValue(of([])),
  moneyTypes$: of([]),
  selectedMoneyType$: of({ code: 'RUB' }),
  getSelectedMoneyType: jest.fn().mockReturnValue({ code: 'RUB' }),
  getLoadedMoneyTypes: jest.fn().mockReturnValue([]),
};

export const fakeActivatedRoute = {
  queryParams: of({}),
  snapshot: {
    paramMap: convertToParamMap({}),
  },
} as ActivatedRoute;
