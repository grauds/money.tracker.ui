import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-totals-component',
  templateUrl: './stats-totals-component.component.html',
  styleUrl: './stats-totals-component.component.css',
})
export class StatsTotalsComponentComponent {
   
  @Input() title: string | undefined;
  
  @Input() value: string | undefined;

  @Input() background = 'var(--pink)';

  @Input() float = 'left';

}
