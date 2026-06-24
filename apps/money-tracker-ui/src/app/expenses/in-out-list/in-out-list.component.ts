import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ResourceCollection,
} from '@lagoshny/ngx-hateoas-client';

import { InOutDelta, MoneyTypes } from '@clematis-shared/model';
import {
  InOutService
} from '@clematis-shared/shared-components';

@Component({
  selector: 'app-in-out-list',
  templateUrl: './in-out-list.component.html',
  styleUrls: ['./in-out-list.component.sass'],
  standalone: false,
})
export class InOutListComponent implements OnInit {
  displayedColumns: string[] = ['commodity.name', 'delta'];

  loading = false;

  totals = { positive: 0, negative: 0 };

  entities: Array<InOutDelta> = [];

  constructor(
    protected inOutService: InOutService,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Reselling');
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.inOutService.getInOutDeltasInCurrency(MoneyTypes.RUB).subscribe({
      next: (response: ResourceCollection<InOutDelta>) => {
        this.entities = response.resources;
        this.totals = this.entities.reduce(
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
}
