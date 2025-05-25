import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  standalone: true
})
export class ErrorMessageComponent {

  @Input() error: string | undefined;


}
