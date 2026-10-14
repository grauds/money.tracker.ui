import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stats-totals-component',
  templateUrl: './stats-totals.component.html',
  styleUrl: './stats-totals.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class StatsTotalsComponent {
  @Input() title: string | undefined;

  @Input() value: string | undefined;

  @Input() background = 'var(--pink)';

  @Input() float = 'left';
}
