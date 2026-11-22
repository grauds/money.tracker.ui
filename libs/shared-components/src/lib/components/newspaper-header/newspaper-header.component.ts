import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-newspaper-header',
  templateUrl: './newspaper-header.component.html',
  styleUrls: ['./newspaper-header.component.sass'],
  standalone: false
})
export class NewspaperHeaderComponent {
  @Input() title: string | undefined;
  @Input() subtitle: string | undefined;
}
