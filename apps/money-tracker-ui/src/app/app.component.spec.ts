import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { AppComponent } from './app.component.js';
import { EnvironmentService } from "@clematis-shared/shared-components";

import Keycloak from "keycloak-js";
import { mockEventSignal, MockKeycloak } from "../mocks/mock_keycloak.js";
import { KEYCLOAK_EVENT_SIGNAL } from "keycloak-angular";


describe('AppComponent', () => {
  const fakeActivatedRoute = {
    snapshot: {
      queryParams: {},
    }
  } as ActivatedRoute;

  const environmentServiceMock: any = {
    getValue: jest.fn().mockReturnValue('http://api.url')
  };

  const routerMock: any = {
    navigate: jest.fn().mockResolvedValue({}),
  };

  const keycloakServiceMock: MockKeycloak = new MockKeycloak();
  jest.spyOn(keycloakServiceMock, 'logout').mockImplementation(jest.fn());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [AppComponent],
      providers: [
        { provide: Keycloak, useValue: keycloakServiceMock },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: mockEventSignal },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: Router, useValue: routerMock },
        { provide: EnvironmentService, useValue: environmentServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Money Tracker'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Money Tracker');
  });

  // TODO: Uncomment and implement these tests when the Keycloak events are properly mocked

/*
  it('should handle OnAuthSuccess event', async () => {
    TestBed.overrideProvider(KEYCLOAK_EVENT_SIGNAL, {
      useValue: signal({ type: KeycloakEventType.AuthSuccess, args: {} })
    });
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app.isLoggedIn).toBe(true);
    expect(keycloakServiceMock.login).toHaveBeenCalled();
  });

  it("should handle OnAuthError event", async () => {
    TestBed.overrideProvider(KEYCLOAK_EVENT_SIGNAL, {
      useValue: signal({ type: KeycloakEventType.AuthError, args: {} })
    });
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app.isLoggedIn).toBe(false);
    expect(app.userProfile).toBeUndefined();
    expect(keycloakServiceMock.logout).toHaveBeenCalled();
  });

  it('should handle AuthLogout event', async () => {
    TestBed.overrideProvider(KEYCLOAK_EVENT_SIGNAL, {
      useValue: signal({ type: KeycloakEventType.AuthLogout, args: {} })
    });
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app.isLoggedIn).toBe(false);
    expect(app.userProfile).toBeUndefined();
    expect(keycloakServiceMock.logout).toHaveBeenCalled();
  });

  it('should navigate to redirect URL if present in query params', async () => {
    TestBed.overrideProvider(KEYCLOAK_EVENT_SIGNAL, { useValue: of({ type: KeycloakEventType.AuthSuccess }) });

    const queryParams = { redirect: 'some-url' };
    const params = new HttpParams().set('redirect', 'some-url');
    const parsedParams = { someKey: 'someValue' };

    jest.spyOn(Utils, 'moveQueryParametersFromRedirectUrl').mockReturnValue(params);
    jest.spyOn(Utils, 'parseRedirectParameters').mockReturnValue(parsedParams);

    fakeActivatedRoute.snapshot.queryParams = queryParams;

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(routerMock.navigate).toHaveBeenCalledWith(['some-url'], {
        queryParams: parsedParams
    });
  });

*/

});


