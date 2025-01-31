import { Component, Inject } from '@angular/core';
import { ErrorDialogService } from '../../error/error-dialog.service';
import { HttpError } from '@clematis-shared/model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css'],
})
export class ErrorDialogComponent {
  constructor(
    public modal: ErrorDialogService,
    @Inject(MAT_DIALOG_DATA) public error: HttpError
  ) {}

  close() {
    this.modal.close();
  }
}
