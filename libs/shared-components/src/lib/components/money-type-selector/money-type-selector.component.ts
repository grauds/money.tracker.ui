import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MoneyType } from '@clematis-shared/model';

@Component({
  selector: 'app-money-type-selector',
  templateUrl: './money-type-selector.component.html',
  styleUrls: ['./money-type-selector.component.sass'],
  standalone: false
})
export class MoneyTypeSelectorComponent {
  @Input() label = '';

  @Input() disabled = false;

  @Input() currencies: MoneyType[] = [];

  @Input() currency: MoneyType | undefined;

  @Output() currency$: EventEmitter<MoneyType> = new EventEmitter<MoneyType>();

  compareFn(to: MoneyType, from: MoneyType) {
    return to && from ? to.code === from.code : to === from;
  }

  onCurrencyChange($event: MoneyType) {
    this.currency = $event;
    this.currency$.next($event);
  }
}
