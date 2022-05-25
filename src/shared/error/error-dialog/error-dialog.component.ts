import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

  @Input()
  message: string = ''

  @Input()
  status: number = 0

  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  dismiss() {
    this.modal.dismiss()
  }

  close() {
    this.modal.close()
  }
}
