import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { KeycloakService, KeycloakEventType } from 'keycloak-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Utils } from '@clematis-shared/model';
import { HttpParams } from '@angular/common/http';

describe('AppComponent', () => {
  const fakeActivatedRoute = {
    snapshot: {
      queryParams: {},
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        KeycloakService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
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

  describe('AppComponent', () => {
    let keycloakServiceMock: any;
    let routerMock: any;

    beforeEach(async () => {
      keycloakServiceMock = {
        keycloakEvents$: of(),
        loadUserProfile: jest.fn().mockResolvedValue({}),
        login: jest.fn().mockResolvedValue({}),
      };

      routerMock = {
        navigate: jest.fn().mockResolvedValue({}),
      };

      await TestBed.configureTestingModule({
        declarations: [AppComponent],
        providers: [
          { provide: KeycloakService, useValue: keycloakServiceMock },
          { provide: ActivatedRoute, useValue: fakeActivatedRoute },
          { provide: Router, useValue: routerMock },
        ],
      }).compileComponents();
    });

    it('should handle OnAuthSuccess event', async () => {
      keycloakServiceMock.keycloakEvents$ = of({ type: KeycloakEventType.OnAuthSuccess });
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();

      expect(app.isLoggedIn).toBe(true);
      expect(keycloakServiceMock.loadUserProfile).toHaveBeenCalled();
    });

    it('should handle OnAuthError event', async () => {
      keycloakServiceMock.keycloakEvents$ = of({ type: KeycloakEventType.OnAuthError });
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();

      expect(app.isLoggedIn).toBe(false);
      expect(app.userProfile).toBeNull();
      expect(keycloakServiceMock.login).toHaveBeenCalled();
    });

    it('should handle OnAuthLogout event', async () => {
      keycloakServiceMock.keycloakEvents$ = of({ type: KeycloakEventType.OnAuthLogout });
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();

      expect(app.isLoggedIn).toBe(false);
      expect(app.userProfile).toBeNull();
      expect(keycloakServiceMock.login).toHaveBeenCalled();
    });

    it('should handle OnReady event when not logged in', async () => {
      keycloakServiceMock.keycloakEvents$ = of({ type: KeycloakEventType.OnReady });
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();

      expect(keycloakServiceMock.login).toHaveBeenCalled();
    });

    it('should navigate to redirect URL if present in query params', async () => {
      keycloakServiceMock.keycloakEvents$ = of({ type: KeycloakEventType.OnAuthSuccess });

      const queryParams = { redirect: 'some-url' };
      const params = new HttpParams().set('redirect', 'some-url');
      const parsedParams = { someKey: 'someValue' };

      jest.spyOn(Utils, 'moveQueryParametersFromRedirectUrl').mockReturnValue(params);
      jest.spyOn(Utils, 'parseRedirectParameters').mockReturnValue(parsedParams);

      fakeActivatedRoute.snapshot.queryParams = queryParams;

      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();

      expect(routerMock.navigate).toHaveBeenCalledWith(['some-url'], {
          queryParams: parsedParams
        });
    });
  });
});
