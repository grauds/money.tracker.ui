import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ErrorDialogService } from './error-dialog.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private errorDialogService: ErrorDialogService,
    private zone: NgZone
  ) {}

  handleError(error: any) {
    this.zone.run(() =>
      this.errorDialogService.open(
        error?.message || 'Undefined client error',
        error?.status || ''
      )
    );

    console.error('Throw at you 🍅', error);
  }
}
