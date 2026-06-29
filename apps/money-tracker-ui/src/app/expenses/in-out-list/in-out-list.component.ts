import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import {
  PagedResourceCollection,
} from '@lagoshny/ngx-hateoas-client';

import { InOutDelta, MoneyType } from '@clematis-shared/model';
import {
  InOutService,
  MoneyTypeService
} from '@clematis-shared/shared-components';

@Component({
  selector: 'app-in-out-list',
  templateUrl: './in-out-list.component.html',
  styleUrls: ['./in-out-list.component.sass'],
  standalone: false,
})
export class InOutListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['commodity.name', 'delta'];

  loading = false;

  totals = { positive: 0, negative: 0 };

  currency: MoneyType = this.moneyTypeService.getSelectedMoneyType();

  private destroy$ = new Subject<void>();

  constructor(
    protected inOutService: InOutService,
    private readonly moneyTypeService: MoneyTypeService,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Reselling');
    this.moneyTypeService.selectedMoneyType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currency = this.moneyTypeService.getSelectedMoneyType();
        this.loadData();
      });
  }

  loadData() {
    this.loading = true;

    this.inOutService.getInOutDeltasInCurrency(this.currency).subscribe({
      next: (response: PagedResourceCollection<InOutDelta>) => {
        this.totals = response.resources.reduce(
          (accumulator, object) => {
            if (object.delta > 0) {
              accumulator.positive += object.delta;
            } else if (object.delta < 0) {
              accumulator.negative += object.delta;
            }
            return accumulator;
          },
          { positive: 0, negative: 0 },
        );
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
