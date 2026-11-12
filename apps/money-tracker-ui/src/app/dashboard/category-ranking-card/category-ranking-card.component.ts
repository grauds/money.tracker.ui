import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

export interface CategoryAmountItem {
  name: string;
  total: number;
  txCount?: number;
}

export interface ProcessedCategoryItem extends CategoryAmountItem {
  rank: number;
  sharePercent: number;
  relativeWidthPercent: number;
}

@Component({
  selector: 'app-category-ranking-card',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './category-ranking-card.component.html',
  styleUrl: './category-ranking-card.component.sass',
})
export class CategoryRankingCardComponent {
  title = input.required<string>();
  items = input.required<CategoryAmountItem[]>();
  baseCurrency = input<string>('USD');
  type = input<'income' | 'expense'>('expense');
  limit = input<number>(20);
  loading = input<boolean>(false);

  // Skeleton placeholder rows
  readonly skeletonRows = Array.from({ length: 8 }, (_, i) => i);

  totalSum = computed(() =>
    (this.items() ?? []).reduce((acc, item) => acc + Math.abs(item.total), 0),
  );

  topItems = computed<ProcessedCategoryItem[]>(() => {
    const raw = this.items() ?? [];
    const sorted = [...raw]
      .filter((i) => Math.abs(i.total) > 0)
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
      .slice(0, this.limit());

    if (sorted.length === 0) return [];

    const overallTotal = this.totalSum();
    const maxItemAmount = Math.abs(sorted[0].total);

    return sorted.map((item, idx) => {
      const absVal = Math.abs(item.total);
      return {
        ...item,
        rank: idx + 1,
        sharePercent: overallTotal > 0 ? (absVal / overallTotal) * 100 : 0,
        // Scale progress bar relative to #1 category so visual differences pop
        relativeWidthPercent:
          maxItemAmount > 0 ? (absVal / maxItemAmount) * 100 : 0,
      };
    });
  });
}
