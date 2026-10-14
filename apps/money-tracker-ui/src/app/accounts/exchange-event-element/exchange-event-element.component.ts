import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MoneyExchange } from '@clematis-shared/model';

@Component({
  selector: 'app-exchange-event-element',
  templateUrl: './exchange-event-element.component.html',
  styleUrls: ['./exchange-event-element.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ExchangeEventElementComponent {
  @Input() entity: MoneyExchange = new MoneyExchange();
}
