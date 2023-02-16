import { Injectable } from '@angular/core';
import { ErrorDialogComponent } from "../components/error-dialog/error-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Injectable()
export class ErrorDialogService {

  private isDialogOpen = false;

  constructor(public dialog: MatDialog) { }

  open(message: string, status: number): any {

    if (this.isDialogOpen) {
      return false;
    }

    this.isDialogOpen = true;
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: { message: message, status: status }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isDialogOpen = false;
    });

  }

  close() {
    this.dialog.closeAll()
  }
}
