import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-totals-component',
  templateUrl: './stats-totals.component.html',
  styleUrl: './stats-totals.component.css',
})
export class StatsTotalsComponent {
   
  @Input() title: string | undefined;
  
  @Input() value: string | undefined;

  @Input() background = 'var(--pink)';

  @Input() float = 'left';

}
