import { ExpenseItem } from '@clematis-shared/model';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { formatDate } from '@angular/common';
import { RequestParam } from '@lagoshny/ngx-hateoas-client';
import { ExpenseItemsService } from '../../../service/expense-items.service';

export type ExpenseColumn =
  'commodityname' | 'transferdate' | 'price' | 'qty' | 'organizationname';

@Component({
  selector: 'app-entity-expenses',
  templateUrl: './entity-expenses.component.html',
  styleUrls: ['./entity-expenses.component.sass'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class EntityExpensesComponent {
  loading = false;

  expenses: ExpenseItem[] = [];

  private readonly allColumns: ExpenseColumn[] = [
    'commodityname',
    'organizationname',
    'transferdate',
    'price',
    'qty',
  ];

  @Input() hiddenColumns: ExpenseColumn[] = [];

  get displayedColumns(): ExpenseColumn[] {
    if (!this.hiddenColumns || this.hiddenColumns.length === 0) {
      return this.allColumns;
    }
    return this.allColumns.filter((col) => !this.hiddenColumns.includes(col));
  }

  @Input({ required: true }) expenseService!: ExpenseItemsService;
  @Input({ required: true }) cookieStateKey!: string;
  @Input({ required: true }) queryArguments!: RequestParam;
  @Input({ required: true }) queryName!: string;

  chartConfig: any = {};

  @Output() loadingChanged = new EventEmitter<boolean>();
  @Output() entitiesChanged = new EventEmitter<ExpenseItem[]>();

  onLoading(loading: boolean): void {
    queueMicrotask(() => {
      this.loading = loading;
      this.loadingChanged.emit(loading);
    });
  }

  onEntitiesReceived(entities: ExpenseItem[]): void {
    setTimeout(() => {
      this.expenses = entities || [];
      if (this.expenses.length > 1) {
        this.chartConfig = this.generateChartConfig(this.expenses);
      } else {
        this.chartConfig = {};
      }
      this.entitiesChanged.emit(this.expenses);
    });
  }

  private generateChartConfig(expenses: ExpenseItem[]): any {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: any) {
          if (params) {
            return params
              .map((param: any) => {
                return (
                  param.seriesName + ' : ' + Math.round(param.value * 100) / 100
                );
              })
              .join('<br/>');
          }
          return 'No params';
        },
      },
      legend: {
        data: ['Total', 'Price'],
        bottom: 0,
      },
      xAxis: {
        type: 'category',
        data: expenses.map((expense) => {
          return formatDate(
            expense.transferDate,
            'shortDate',
            navigator.language,
          );
        }),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Total',
          data: expenses.map((expense) => {
            return expense.qty * expense.price;
          }),
          type: 'line',
        },
        {
          name: 'Price',
          data: expenses.map((expense) => {
            return expense.price;
          }),
          type: 'line',
        },
      ],
    };
  }
}
