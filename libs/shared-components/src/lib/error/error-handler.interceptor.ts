import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { catchError, map, Observable, throwError } from "rxjs";
import { ErrorDialogService } from './error-dialog.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerInterceptor implements HttpInterceptor {

  constructor(private errorDialogService: ErrorDialogService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler):
    Observable<HttpEvent<unknown>> {

     return next.handle(request).pipe(
       map((event: HttpEvent<any>) => {
         if (event instanceof HttpResponse) {
           console.log('event--->>>', event);
         }
         return event;
       }),
       catchError((error: HttpErrorResponse) => {
         let data = {
           reason: error && error.error && error.error.reason ? error.error.reason : error.message,
           status: error.status
         };
         this.errorDialogService.open(data.reason, data.status);
         return throwError(() => error);
       }));

  }
}
