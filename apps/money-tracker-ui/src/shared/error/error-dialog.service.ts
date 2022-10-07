import {Injectable, Injector} from '@angular/core';

@Injectable()
export class ErrorDialogService {

  ///dlg: NgbModalRef | undefined

  constructor(private injector: Injector) {}

  open(message?: string, status?: number): void {

  }

  close() {

  }
}
