import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MoneyType } from '@clematis-shared/model';

export interface PurchasePricePoint {
  tradeplaceName: string;
  transferDate: string | Date;
  price: number;
  currencyCode?: string;
}

@Component({
  selector: 'lib-entity-balance-info',
  templateUrl: './entity-balance-info.component.html',
  styleUrl: './entity-balance-info.component.sass',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class EntityBalanceInfoComponent {
  @Input() loading = false;
  @Input() currency!: MoneyType;
  @Input() incomeSum = 0;
  @Input() expensesSum = 0;
  @Input() unitTypeName: string | undefined;
  @Input() averagePrice: number | undefined;
  @Input() totalQty: number | undefined;
  @Input() description: string | undefined;
  @Input() purchaseHistory: PurchasePricePoint[] = [];
}
