import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MoneyType, PurchasePricePoint } from '@clematis-shared/model';

export type SortDirection = 'asc' | 'desc' | null;

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

  sortColumn: 'place' | 'date' | 'price' | null = 'price';
  sortDirection: SortDirection = 'asc';

  get sortedHistory(): PurchasePricePoint[] {
    if (!this.sortColumn) {
      return this.purchaseHistory;
    }
    const sorted = [...this.purchaseHistory];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (this.sortColumn === 'place') {
        comparison = (a.tradeplaceName || '').localeCompare(b.tradeplaceName || '');
      } else if (this.sortColumn === 'date') {
        const dateA = new Date(a.transferDate).getTime();
        const dateB = new Date(b.transferDate).getTime();
        comparison = dateA - dateB;
      } else if (this.sortColumn === 'price') {
        comparison = a.price - b.price;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }

  toggleSort(column: 'place' | 'date' | 'price') {
    if (this.sortColumn === column) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortColumn = null;
        this.sortDirection = null;
      }
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  sortIndicator(column: 'place' | 'date' | 'price'): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

  isSortedBy(column: 'place' | 'date' | 'price'): boolean {
    return this.sortColumn === column;
  }
}
