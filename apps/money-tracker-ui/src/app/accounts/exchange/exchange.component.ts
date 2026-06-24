import {
  Component,
  Inject,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { PagedResourceCollection, Sort } from '@lagoshny/ngx-hateoas-client';
import {
  MoneyExchange,
  MoneyExchangeReport,
  MoneyType,
} from '@clematis-shared/model';

import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {
  EntityListComponent,
  MoneyExchangeService,
  MoneyTypeService,
} from '@clematis-shared/shared-components';

import { Observable, of, Subscription, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.sass'],
  providers: [{ provide: 'searchService', useClass: MoneyExchangeService }],
  standalone: false,
})
export class ExchangeComponent implements OnInit, AfterViewInit {
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<MoneyExchange>;

  pageSubscription: Subscription | undefined;

  options: any;

  loading = false;

  sourceCurrency!: MoneyType;

  destCurrency!: MoneyType;

  currencies: MoneyType[] = [];

  displayedColumns: string[] = [
    'exchangedate',
    'sourceamount',
    'destamount',
    'rate',
    'ratedelta',
    'delta',
  ];

  report?: MoneyExchangeReport;

  private resetPages = false;

  constructor(
    private readonly moneyTypeService: MoneyTypeService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    @Inject('searchService')
    private readonly moneyExchangeService: MoneyExchangeService,
  ) {
    this.moneyExchangeService.setPostProcessingStream(
      this.postProcessingHandler.bind(this),
    );
  }

  ngOnInit(): void {
    this.title.setTitle('Currency Exchange');
    this.moneyTypeService.moneyTypes$.subscribe((types) => {
      this.currencies = types;
    });
    this.pageSubscription = this.route.queryParams
      .pipe(
        switchMap((queryParam: any) => {
          const sourceCode = queryParam['source'] || 'RUB';
          return this.moneyTypeService.getCurrencyByCode(sourceCode).pipe(
            switchMap((sourceRes) => {
              this.sourceCurrency = sourceRes;

              const destCode = queryParam['dest'] || 'USD';
              return this.moneyTypeService.getCurrencyByCode(destCode);
            }),
          );
        }),
      )
      .subscribe((destRes) => {
        this.destCurrency = destRes;
        this.loadData();
      });
  }

  ngAfterViewInit() {
    this.loadData();
  }

  private loadData() {
    if (
      this.sourceCurrency?.code &&
      this.destCurrency?.code &&
      this.entityList
    ) {
      this.entityList.refreshData(
        {
          queryArguments: this.getQueryArguments(),
          queryName: 'events',
        },
        this.resetPages,
      );
    }
  }

  getSourceCurrencies() {
    return this.currencies.filter((value: MoneyType) => {
      return value?.code !== this.destCurrency?.code;
    });
  }

  getDestCurrencies() {
    return this.currencies.filter((value: MoneyType) => {
      return value?.code !== this.sourceCurrency?.code;
    });
  }

  swapCurrencies() {
    const swap = this.sourceCurrency;
    this.sourceCurrency = this.destCurrency;
    this.destCurrency = swap;
    this.resetPages = false;
    this.updateRoute();
  }

  updatesSourceCurrency($event: MoneyType) {
    this.sourceCurrency = $event;
    this.resetPages = true;
    this.updateRoute();
  }

  updatesDestCurrency($event: MoneyType) {
    this.destCurrency = $event;
    this.resetPages = true;
    this.updateRoute();
  }

  updateRoute() {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.getQueryArguments(),
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  getQueryArguments(): any {
    if (this.sourceCurrency?.code && this.destCurrency?.code) {
      return {
        source: this.sourceCurrency?.code,
        dest: this.destCurrency?.code,
        sort: this.getSort()
      };
    }
    return {};
  }

  getSort(): Sort {
    return {
      exchangedate: 'DESC',
    };
  }

  setLoading($event: boolean) {
    setTimeout(() => {
      this.loading = $event;
    });
  }

  postProcessingHandler = (
    res: PagedResourceCollection<MoneyExchange>,
  ): Observable<PagedResourceCollection<MoneyExchange>> => {
    return of(res).pipe(
      tap(() =>
        this.moneyExchangeService.setProcessingStatusDescription(
          'loading exchange report',
        ),
      ),
      switchMap((res: PagedResourceCollection<MoneyExchange>) => {
        return this.moneyExchangeService
          .getExchangeReport(this.sourceCurrency, this.destCurrency)
          .pipe(
            switchMap((report: MoneyExchangeReport) => {
              this.report = report;
              return of(res);
            }),
          );
      }),
    );
  };
}
