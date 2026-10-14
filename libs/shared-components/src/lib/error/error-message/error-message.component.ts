import { Component, Input, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ErrorMessageComponent {

  @Input() error: string | undefined;


}
