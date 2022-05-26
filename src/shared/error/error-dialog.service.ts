import {Injectable, Injector} from '@angular/core';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';

@Injectable()
export class ErrorDialogService {

  dlg: NgbModalRef | undefined

  constructor(private injector: Injector) {}

  open(message?: string, status?: number): void {
   // if (!this.dlg) {
      // https://github.com/ng-bootstrap/ng-bootstrap/issues/3719
      this.dlg = this.injector.get(NgbModal).open(ErrorDialogComponent);
      this.dlg.componentInstance.message = message
      this.dlg.componentInstance.status = status
   // }
  }

  close() {
    if (this.dlg) {
      this.dlg.close()
      this.dlg = undefined
    }
  }
}
