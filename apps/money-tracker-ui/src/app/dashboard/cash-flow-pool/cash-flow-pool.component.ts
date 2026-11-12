import { Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

export interface CurrencyFlowItem {
  code: string;
  total: number;
  totalConverted: number;
}

export interface FlowStream {
  id: string;
  side: 'in' | 'out';
  code: string;
  total: number;
  totalConverted: number;
  percentage: number;
  color: string;
  isSameCurrency: boolean;
  impliedRate: number;
  path: string;
  labelY: number;
  ribbonHeight: number;
}

@Component({
  selector: 'app-cash-flow-pool',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './cash-flow-pool.component.html',
  styleUrl: './cash-flow-pool.component.sass',
})
export class CashFlowPoolComponent {
  incomes = input.required<CurrencyFlowItem[]>();
  expenses = input.required<CurrencyFlowItem[]>();
  baseCurrency = input<string>('USD');
  loading = input<boolean>(false);

  hoveredStreamId = signal<string | null>(null);

  // SVG coordinate constants
  readonly viewBoxWidth = 920;
  readonly poolWidth = 150;
  readonly poolX = 385;
  readonly leftAnchorX = 245;
  readonly rightAnchorX = 675;

  private readonly minPoolHeight = 272;
  private readonly headerOffset = 44;
  private readonly minLabelSlotHeight = 46;
  private readonly verticalPadding = 32; // Extra breathing room top and bottom

  // Helper to compute exact stack height needed for one side
  private computeSideOuterHeight(items: CurrencyFlowItem[]): number {
    const filtered = items.filter((i) => Math.abs(i.totalConverted) > 0);
    if (filtered.length === 0) return 0;

    const maxVol = this.maxVolume();
    const maxRibbonArea = 190;
    const minRibbonHeight = 5;

    return filtered
      .map((item) => {
        const h = Math.max(
          minRibbonHeight,
          (Math.abs(item.totalConverted) / maxVol) * maxRibbonArea,
        );
        return Math.max(h + 14, this.minLabelSlotHeight);
      })
      .reduce((sum, slotH) => sum + slotH, 0);
  }

  // Dynamically grow canvas height from the actual summed slot heights + padding
  layoutMetrics = computed(() => {
    const inOuterHeight = this.computeSideOuterHeight(this.incomes() ?? []);
    const outOuterHeight = this.computeSideOuterHeight(this.expenses() ?? []);
    const maxOuterHeight = Math.max(inOuterHeight, outOuterHeight);

    const poolHeight = Math.max(
      this.minPoolHeight,
      maxOuterHeight + this.verticalPadding,
    );
    const poolTop = this.headerOffset;
    const viewBoxHeight = poolTop + poolHeight + 36; // Generous bottom buffer prevents clipping

    return {
      poolTop,
      poolHeight,
      viewBoxHeight,
    };
  });

  poolTop = computed(() => this.layoutMetrics().poolTop);
  poolHeight = computed(() => this.layoutMetrics().poolHeight);
  viewBoxHeight = computed(() => this.layoutMetrics().viewBoxHeight);

  private readonly incomePalette = [
    '#1a7a2e',
    '#2e9e44',
    '#40916c',
    '#52b788',
    '#74c69d',
  ];
  private readonly expensePalette = [
    '#a01a1a',
    '#c92a2a',
    '#e03131',
    '#d64545',
    '#e57373',
  ];

  totalIncome = computed(() =>
    (this.incomes() ?? []).reduce(
      (sum, item) => sum + Math.max(0, item.totalConverted),
      0,
    ),
  );

  totalExpense = computed(() =>
    (this.expenses() ?? []).reduce(
      (sum, item) => sum + Math.max(0, item.totalConverted),
      0,
    ),
  );

  netSavings = computed(() => this.totalIncome() - this.totalExpense());

  savingsRate = computed(() => {
    const inc = this.totalIncome();
    return inc > 0 ? (this.netSavings() / inc) * 100 : 0;
  });

  private maxVolume = computed(() =>
    Math.max(this.totalIncome(), this.totalExpense(), 1),
  );

  inflowStreams = computed<FlowStream[]>(() =>
    this.buildStreams(
      this.incomes() ?? [],
      'in',
      this.totalIncome(),
      this.incomePalette,
    ),
  );

  outflowStreams = computed<FlowStream[]>(() =>
    this.buildStreams(
      this.expenses() ?? [],
      'out',
      this.totalExpense(),
      this.expensePalette,
    ),
  );

  hoveredStream = computed<FlowStream | null>(() => {
    const id = this.hoveredStreamId();
    if (!id) return null;
    return (
      this.inflowStreams().find((s) => s.id === id) ??
      this.outflowStreams().find((s) => s.id === id) ??
      null
    );
  });

  private buildStreams(
    rawItems: CurrencyFlowItem[],
    side: 'in' | 'out',
    sideTotal: number,
    palette: string[],
  ): FlowStream[] {
    const sorted = [...rawItems]
      .filter((i) => Math.abs(i.totalConverted) > 0)
      .sort((a, b) => Math.abs(b.totalConverted) - Math.abs(a.totalConverted));

    if (sorted.length === 0) return [];

    const { poolTop, poolHeight } = this.layoutMetrics();
    const maxVol = this.maxVolume();
    const maxRibbonArea = 190;
    const minRibbonHeight = 5;

    // 1. Compute proportional ribbon thicknesses on the pool wall
    const rawHeights = sorted.map((item) =>
      Math.max(
        minRibbonHeight,
        (Math.abs(item.totalConverted) / maxVol) * maxRibbonArea,
      ),
    );
    const totalRibbonStack = rawHeights.reduce((a, b) => a + b, 0);

    // 2. Compute non-overlapping label slot heights on the outer column
    const slotHeights = rawHeights.map((h) =>
      Math.max(h + 12, this.minLabelSlotHeight),
    );
    const totalOuterHeight = slotHeights.reduce((a, b) => a + b, 0);

    // 3. Center both stacks vertically around the pool midpoint
    const poolCenterY = poolTop + poolHeight / 2;
    let currentPoolY = poolCenterY - totalRibbonStack / 2;
    let currentSlotTopY = poolCenterY - totalOuterHeight / 2;

    const base = this.baseCurrency().toUpperCase();

    return sorted.map((item, idx) => {
      const absConverted = Math.abs(item.totalConverted);
      const absOriginal = Math.abs(item.total);
      const h = rawHeights[idx];
      const slotH = slotHeights[idx];

      // Pool wall attachment coordinates (packed tightly)
      const poolY0 = currentPoolY;
      const poolY1 = currentPoolY + h;
      currentPoolY = poolY1;

      // Outer label anchor coordinates (generously spaced)
      const labelY = currentSlotTopY + slotH / 2;
      const outerY0 = labelY - h / 2;
      const outerY1 = labelY + h / 2;
      currentSlotTopY += slotH;

      const path =
        side === 'in'
          ? this.createRibbonPath(
              this.leftAnchorX,
              outerY0,
              outerY1,
              this.poolX,
              poolY0,
              poolY1,
            )
          : this.createRibbonPath(
              this.poolX + this.poolWidth,
              poolY0,
              poolY1,
              this.rightAnchorX,
              outerY0,
              outerY1,
            );

      return {
        id: `${side}-${item.code}`,
        side,
        code: item.code,
        total: item.total,
        totalConverted: item.totalConverted,
        percentage: sideTotal > 0 ? (absConverted / sideTotal) * 100 : 0,
        color: palette[idx % palette.length],
        isSameCurrency: item.code.toUpperCase() === base,
        impliedRate: absOriginal > 0 ? absConverted / absOriginal : 1,
        path,
        labelY,
        ribbonHeight: h,
      };
    });
  }

  // Smooth cubic Bezier ribbon connecting (x0, y0..y1) to (x1, ty0..ty1)
  private createRibbonPath(
    x0: number,
    y0: number,
    y1: number,
    x1: number,
    ty0: number,
    ty1: number,
  ): string {
    const midX = (x0 + x1) / 2;
    return [
      `M ${x0} ${y0}`,
      `C ${midX} ${y0}, ${midX} ${ty0}, ${x1} ${ty0}`,
      `L ${x1} ${ty1}`,
      `C ${midX} ${ty1}, ${midX} ${y1}, ${x0} ${y1}`,
      'Z',
    ].join(' ');
  }
}
