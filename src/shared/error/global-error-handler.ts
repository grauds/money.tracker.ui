import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ErrorDialogService } from './error-dialog.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(
    private errorDialogService: ErrorDialogService,
    private zone: NgZone
  ) {}

  handleError(error: any) {

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }

    this.zone.run(() =>
      this.errorDialogService.open(
      error?.message || 'Undefined client error',
        error?.status || 'Not a HTTP error'
      )
    );

    console.error('Error from global error handler', error);
  }

}
