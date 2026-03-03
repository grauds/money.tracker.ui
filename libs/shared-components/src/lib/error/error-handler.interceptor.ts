import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ErrorDialogService } from './error-dialog.service';
import { EnvironmentService } from "../service/environment.service";

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(private errorDialogService: ErrorDialogService,
              private environmentService: EnvironmentService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          //console.log('event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {

        // Expected case: The interceptor does not handle keycloak auth errors.
        const authUrlRaw = this.environmentService.getValue('authUrl');
        const reqUrl = new URL(request.url, window.location.origin).href.replace(/\/+$/, '');
        const authUrl = authUrlRaw
          ? new URL(authUrlRaw, window.location.origin).href.replace(/\/+$/, '')
          : '';

        if (authUrl && reqUrl.startsWith(authUrl)) {
          // Don't show a dialog for auth server calls
          return throwError(() => error);
        }

        // Expected case: relations / optional resources may legitimately return 404.
        // Don't bother the user with a dialog for that.
        if (request.method === 'GET' && error.status === 404) {
          return throwError(() => error);
        }

        const data = {
          reason:
            error && error.error && error.error.reason
              ? error.error.reason
              : error.message,
          status: error.status,
        };

        this.errorDialogService.open(data.reason, data.status);
        return throwError(() => error);
      })
    );
  }
}
