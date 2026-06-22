import { IncomeItem } from '@clematis-shared/model';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { formatDate } from '@angular/common';
import { RequestParam } from '@lagoshny/ngx-hateoas-client';
import { IncomeItemsService } from '../../../service/income-items.service';

@Component({
  selector: 'app-entity-income',
  templateUrl: './entity-income.component.html',
  styleUrls: ['./entity-income.component.sass'],
  standalone: false,
})
export class EntityIncomeComponent {
  loading = false;

  income: IncomeItem[] = [];

  displayedColumns: string[] = ['commodityname', 'transferdate', 'price', 'organizationname'];

  @Input({ required: true }) incomeService!: IncomeItemsService;
  @Input({ required: true }) cookieStateKey!: string;
  @Input({ required: true }) queryArguments!: RequestParam;
  @Input({ required: true }) queryName!: string;

  chartConfig: any = {};

  @Output() loadingChanged = new EventEmitter<boolean>();
  @Output() entitiesChanged = new EventEmitter<IncomeItem[]>();

  onLoading(loading: boolean): void {
    queueMicrotask(() => {
      this.loading = loading;
      this.loadingChanged.emit(loading);
    });
  }

  onEntitiesReceived(entities: IncomeItem[]): void {
    setTimeout(() => {
      this.income = entities || [];
      if (this.income.length > 1) {
        this.chartConfig = this.generateChartConfig(this.income);
      } else {
        this.chartConfig = {};
      }
      this.entitiesChanged.emit(this.income);
    })
  }

  private generateChartConfig(income: IncomeItem[]): any {
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
        data: ['Value'],
        bottom: 0,
      },
      xAxis: {
        type: 'category',
        data: income.map((income) => {
          return formatDate(
            income.transferDate,
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
          name: 'Value',
          data: income.map((income) => {
            return income.total;
          }),
          type: 'line',
        },
      ],
    };
  }
}
