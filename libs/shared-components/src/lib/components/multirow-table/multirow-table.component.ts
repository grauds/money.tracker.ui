import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export interface MultirowTableItem {
  name: string;
  color: string;
  total: number;
  percentage: number;
}

export interface HoverStripState {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-multirow-table',
  templateUrl: './multirow-table.component.html',
  styleUrls: ['./multirow-table.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MultirowTableComponent {
  @Input() title = 'Visible Items';
  @Input() items: MultirowTableItem[] = [];
  @Input() total = 0;
  @Input() currencyCode = '';

  @Output() rowHover = new EventEmitter<string | null>();

  hoverStrip: HoverStripState = {
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  private activeRowName: string | null = null;

  onRowEnter(event: MouseEvent, itemName: string): void {
    const rowEl = event.currentTarget as HTMLElement | null;
    if (!rowEl) {
      return;
    }

    this.hoverStrip = {
      visible: true,
      x: rowEl.offsetLeft,
      y: rowEl.offsetTop,
      width: rowEl.offsetWidth,
      height: rowEl.offsetHeight,
    };

    if (this.activeRowName !== itemName) {
      this.activeRowName = itemName;
      this.rowHover.emit(itemName);
    }
  }

  onRowMove(event: MouseEvent): void {
    const rowEl = event.currentTarget as HTMLElement | null;
    if (!rowEl || !this.hoverStrip.visible) {
      return;
    }

    this.hoverStrip.x = rowEl.offsetLeft;
    this.hoverStrip.y = rowEl.offsetTop;
  }

  onRowLeave(): void {
    this.hoverStrip.visible = false;

    if (this.activeRowName !== null) {
      this.activeRowName = null;
      this.rowHover.emit(null);
    }
  }
}
