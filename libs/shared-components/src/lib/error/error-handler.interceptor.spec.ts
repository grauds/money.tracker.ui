import { TestBed } from '@angular/core/testing';
import { HttpHandler, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErrorHandlerInterceptor } from './error-handler.interceptor';
import { ErrorDialogService } from './error-dialog/error-dialog.service';
import { EnvironmentService } from '../service/environment.service';

describe('ErrorHandlerInterceptor', () => {
  let interceptor: ErrorHandlerInterceptor;
  let errorDialogServiceMock: jest.Mocked<ErrorDialogService>;
  let environmentServiceMock: jest.Mocked<EnvironmentService>;

  const mockAuthUrl = 'http://keycloak.example.com/auth';
  const mockApiUrl = 'http://api.example.com/data';

  const createRequest = (method: string, url: string): HttpRequest<unknown> =>
    new HttpRequest(method as never, url);

  beforeEach(() => {
    errorDialogServiceMock = {
      open: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<ErrorDialogService>;

    environmentServiceMock = {
      getValue: jest.fn((key: string) => {
        if (key === 'authUrl') return mockAuthUrl;
        return '';
      }),
    } as unknown as jest.Mocked<EnvironmentService>;

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerInterceptor,
        { provide: ErrorDialogService, useValue: errorDialogServiceMock },
        { provide: EnvironmentService, useValue: environmentServiceMock },
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
      ],
    });

    interceptor = TestBed.inject(ErrorHandlerInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  describe('intercept - success responses', () => {
    it('should pass through HttpResponse unchanged', (done) => {
      const request = createRequest('GET', mockApiUrl);
      const next = {
        handle: jest.fn().mockReturnValue(
          new Observable<HttpEventType | HttpResponse<any>>((observer) => {
            observer.next(new HttpResponse({ status: 200 }));
            observer.complete();
          })
        ),
      } as unknown as HttpHandler;

      interceptor.intercept(request, next).subscribe({
        next: (event) => {
          expect(event.type).toBe(HttpEventType.Response);
          expect((event as HttpResponse<any>).status).toBe(200);
          done();
        },
        error: done,
      });
    });
  });

  describe('intercept - auth URL skip', () => {
    it('should NOT open error dialog when request URL starts with authUrl', (done) => {
      const authRequest = createRequest('POST', `${mockAuthUrl}/token`);
      const next = {
        handle: jest.fn().mockReturnValue(
          new Observable<HttpEventType | HttpResponse<any> | Error>(observer => {
            observer.error({
              name: 'HttpErrorResponse',
              status: 401,
              message: 'Unauthorized',
              error: { reason: 'Auth error' },
            });
          })
        ),
      } as unknown as HttpHandler;

      interceptor.intercept(authRequest, next).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(errorDialogServiceMock.open).not.toHaveBeenCalled();
          done();
        },
        complete: done,
      });
    });

    it('should NOT open error dialog when authUrl has trailing slash', (done) => {
      environmentServiceMock.getValue = jest.fn().mockReturnValue(
        'http://keycloak.example.com/auth/'
      );

      const authRequest = createRequest('POST', 'http://keycloak.example.com/auth/token');
      const next = {
        handle: jest.fn().mockReturnValue(
          new Observable<HttpEventType | HttpResponse<any> | Error>(observer => {
            observer.error({
              status: 401,
              message: 'Unauthorized',
            });
          })
        ),
      } as unknown as HttpHandler;

      interceptor.intercept(authRequest, next).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(errorDialogServiceMock.open).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('intercept - 404 GET skip', () => {
    it('should NOT open error dialog for GET requests returning 404', (done) => {
      const get404Request = createRequest('GET', `${mockApiUrl}/nonexistent`);
      const next = {
        handle: jest.fn().mockReturnValue(
          new Observable<HttpEventType | HttpResponse<any> | Error>(observer => {
            observer.error({
              name: 'HttpErrorResponse',
              status: 404,
              message: 'Not Found',
            });
          })
        ),
      } as unknown as HttpHandler;

      interceptor.intercept(get404Request, next).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(errorDialogServiceMock.open).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('intercept - error dialog opened', () => {
    it('should open error dialog for non-GET 404 errors', (done) => {
      const post404Request = createRequest('POST', `${mockApiUrl}/resource`);
      const next = {
        handle: jest.fn().mockReturnValue(
          new Observable<HttpEventType | HttpResponse<any> | Error>(observer => {
            observer.error({
              name: 'HttpErrorResponse',
              status: 404,
              message: 'Not Found',
              error: { reason: 'Resource not found' },
            });
          })
        ),
      } as unknown as HttpHandler;

      interceptor.intercept(post404Request, next).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(errorDialogServiceMock.open).toHaveBeenCalledWith(
            'Resource not found',
            404
          );
          done();
        },
      });
    });

    it('should open error dialog for 500 errors with error.error.reason', (done) => {
      const putRequest = createRequest('PUT', `${mockApiUrl}/resource`);
      const next = {
        handle: jest.fn().mockReturnValue(
          new Observable<HttpEventType | HttpResponse<any> | Error>(observer => {
            observer.error({
              name: 'HttpErrorResponse',
              status: 500,
              message: 'Internal Server Error',
              error: { reason: 'Database connection failed' },
            });
          })
        ),
      } as unknown as HttpHandler;

      interceptor.intercept(putRequest, next).subscribe({
        error: (error) => {
          expect(errorDialogServiceMock.open).toHaveBeenCalledWith(
            'Database connection failed',
            500
          );
          done();
        },
      });
    });

    it('should fallback to error.message when error.error.reason is missing', (done) => {
      const deleteRequest = createRequest('DELETE', `${mockApiUrl}/resource`);
      const next = {
        handle: jest.fn().mockReturnValue(
          new Observable<HttpEventType | HttpResponse<any> | Error>(observer => {
            observer.error({
              name: 'HttpErrorResponse',
              status: 503,
              message: 'Service Unavailable',
            });
          })
        ),
      } as unknown as HttpHandler;

      interceptor.intercept(deleteRequest, next).subscribe({
        error: (error) => {
          expect(errorDialogServiceMock.open).toHaveBeenCalledWith(
            'Service Unavailable',
            503
          );
          done();
        },
      });
    });

    it('should open error dialog for 403 errors', (done) => {
      const request = createRequest('GET', `${mockApiUrl}/forbidden`);
      const next = {
        handle: jest.fn().mockReturnValue(
          new Observable<HttpEventType | HttpResponse<any> | Error>(observer => {
            observer.error({
              status: 403,
              message: 'Forbidden',
            });
          })
        ),
      } as unknown as HttpHandler;

      interceptor.intercept(request, next).subscribe({
        error: () => {
          expect(errorDialogServiceMock.open).toHaveBeenCalledWith(
            'Forbidden',
            403
          );
          done();
        },
      });
    });
  });

  describe('intercept - empty authUrl', () => {
    it('should open error dialog when authUrl is empty and request is not auth-related', (done) => {
      environmentServiceMock.getValue = jest.fn().mockReturnValue('');

      const postRequest = createRequest('POST', `${mockApiUrl}/resource`);
      const next = {
        handle: jest.fn().mockReturnValue(
          new Observable<HttpEventType | HttpResponse<any> | Error>(observer => {
            observer.error({
              status: 500,
              message: 'Server Error',
            });
          })
        ),
      } as unknown as HttpHandler;

      interceptor.intercept(postRequest, next).subscribe({
        error: () => {
          expect(errorDialogServiceMock.open).toHaveBeenCalledWith(
            'Server Error',
            500
          );
          done();
        },
      });
    });
  });
});
