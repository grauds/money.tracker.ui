import { ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GlobalErrorHandler } from './error/global-error-handler';
import { ErrorDialogComponent } from './error/error-dialog/error-dialog.component';
import { ErrorHandlerInterceptor } from './error/error-handler.interceptor';
import { ErrorDialogService } from './error/error-dialog.service';
import { HTTP_INTERCEPTORS } from "@angular/common/http";

@NgModule({
  declarations: [ErrorDialogComponent],
  imports: [
    CommonModule
  ],
  providers: [ErrorDialogService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true,
    }
  ]
})
export class SharedModule { }
