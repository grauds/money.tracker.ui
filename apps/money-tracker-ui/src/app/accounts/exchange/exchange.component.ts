import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PagedResourceCollection, Sort } from '@lagoshny/ngx-hateoas-client';
import { MoneyExchange, MoneyExchangeReport, MoneyType } from '@clematis-shared/model';

import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { EntityListComponent, MoneyExchangeService, MoneyTypeService } from '@clematis-shared/shared-components';

import { distinctUntilChanged, Observable, of, Subscription, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.sass'],
  providers: [{ provide: 'searchService', useClass: MoneyExchangeService }],
  standalone: false,
})
export class ExchangeComponent implements OnInit, OnDestroy {
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
    console.log('MoneyExchangeComponent: Initializing constructor');
    this.moneyExchangeService.setPostProcessingStream(
      this.postProcessingHandler.bind(this),
    );
    console.log(
      'MoneyExchangeComponent: Post-processing stream handler successfully bound',
    );
  }

  ngOnInit(): void {
    console.log('MoneyExchangeComponent: Entering ngOnInit');
    this.title.setTitle('Currency Exchange');

    this.moneyTypeService.moneyTypes$.subscribe((types) => {
      console.log(
        'MoneyExchangeComponent: Received moneyTypes$ stream update',
        types,
      );
      this.currencies = types;
    });

    this.pageSubscription = this.route.queryParams
      .pipe(
        // Filter out changes unless 'source' or 'dest' keys have altered values
        distinctUntilChanged((prev: any, curr: any) => {
          const isSourceSame =
            (prev['source'] || 'RUB') === (curr['source'] || 'RUB');
          const isDestSame =
            (prev['dest'] || 'USD') === (curr['dest'] || 'USD');

          if (isSourceSame && isDestSame) {
            console.log(
              'MoneyExchangeComponent: Router update ignored. "source" and "dest" have not changed.',
              { prev, curr },
            );
          }
          return isSourceSame && isDestSame;
        }),
        switchMap((queryParam: any) => {
          console.log(
            'MoneyExchangeComponent: queryParams stream triggered (Passed Filter)',
            queryParam,
          );
          const sourceCode = queryParam['source'] || 'RUB';
          console.log(
            `MoneyExchangeComponent: Fetching source currency by code: "${sourceCode}"`,
          );

          return this.moneyTypeService.getCurrencyByCode(sourceCode).pipe(
            switchMap((sourceRes) => {
              console.log(
                'MoneyExchangeComponent: Source currency response received',
                sourceRes,
              );
              this.sourceCurrency = sourceRes;

              const destCode = queryParam['dest'] || 'USD';
              console.log(
                `MoneyExchangeComponent: Fetching destination currency by code: "${destCode}"`,
              );
              return this.moneyTypeService.getCurrencyByCode(destCode);
            }),
          );
        }),
      )
      .subscribe((destRes) => {
        console.log(
          'MoneyExchangeComponent: Destination currency response received. Resolving initialization pipeline.',
          destRes,
        );
        this.destCurrency = destRes;
        this.loadData();
      });
  }

  private loadData() {
    console.log(
      'MoneyExchangeComponent: loadData execution sequence requested',
      {
        sourceCurrencyCode: this.sourceCurrency?.code,
        destCurrencyCode: this.destCurrency?.code,
        hasEntityList: !!this.entityList,
        resetPages: this.resetPages,
      },
    );

    if (!this.currencies || this.currencies.length === 0) {
      console.warn(
        'MoneyExchangeComponent: Postponing loadData - currencies lookup dataset is empty.',
      );
      return;
    }

    if (
      this.sourceCurrency?.code &&
      this.destCurrency?.code &&
      this.entityList
    ) {
      const args = this.getQueryArguments();
      console.log(
        'MoneyExchangeComponent: Dispatching refreshData event to ' +
          'entityList component reference with arguments:',
        args,
      );
      this.entityList.refreshData(
        {
          queryArguments: args,
          queryName: 'events',
        },
        this.resetPages,
      );
    } else {
      console.warn(
        'MoneyExchangeComponent: loadData criteria was not completely met. Skipping execution.',
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
    console.log(
      'MoneyExchangeComponent: Swapping active target currency positions',
      {
        fromSource: this.sourceCurrency?.code,
        fromDest: this.destCurrency?.code,
      },
    );
    const swap = this.sourceCurrency;
    this.sourceCurrency = this.destCurrency;
    this.destCurrency = swap;
    this.resetPages = false;
    this.updateRoute();
  }

  updatesSourceCurrency($event: MoneyType) {
    console.log(
      'MoneyExchangeComponent: updatesSourceCurrency template trigger received',
      $event,
    );
    this.sourceCurrency = $event;
    this.resetPages = true;
    this.updateRoute();
  }

  updatesDestCurrency($event: MoneyType) {
    console.log(
      'MoneyExchangeComponent: updatesDestCurrency template trigger received',
      $event,
    );
    this.destCurrency = $event;
    this.resetPages = true;
    this.updateRoute();
  }

  updateRoute() {
    const targetArgs = this.getQueryArguments();
    const currentParams = this.route.snapshot.queryParams;

    const isSourceSame = currentParams['source'] === targetArgs.source;
    const isDestSame = currentParams['dest'] === targetArgs.dest;

    if (isSourceSame && isDestSame) {
      console.log(
        'MoneyExchangeComponent: URL matches targets exactly. Skipping redundant navigation.',
      );
      return Promise.resolve(true);
    }

    console.log(
      'MoneyExchangeComponent: Executing precise parameter synchronization pass:',
      { currentParams, targetArgs },
    );

    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...currentParams,
        source: targetArgs.source ?? null,
        dest: targetArgs.dest ?? null,
      },
      queryParamsHandling: '',
      skipLocationChange: false,
    });
  }

  getQueryArguments(): any {
    if (this.sourceCurrency?.code && this.destCurrency?.code) {
      return {
        source: this.sourceCurrency?.code,
        dest: this.destCurrency?.code,
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
    console.log(
      `MoneyExchangeComponent: Deferring component loading indicator value evaluation to macro-task loop queue: ${$event}`,
    );
    setTimeout(() => {
      this.loading = $event;
      console.log(
        `MoneyExchangeComponent: Asynchronous timeout context finished updating component loading property to: ${this.loading}`,
      );
    });
  }

  postProcessingHandler = (
    res: PagedResourceCollection<MoneyExchange>,
  ): Observable<PagedResourceCollection<MoneyExchange>> => {
    console.log(
      'MoneyExchangeComponent: PostProcessingHandler execution stream bound interceptor initialized.',
      res,
    );
    return of(res).pipe(
      tap(() => {
        console.log(
          'MoneyExchangeComponent: PostProcessing Pipeline status description notification initialized',
        );
        this.moneyExchangeService.setProcessingStatusDescription(
          'loading exchange report',
        );
      }),
      switchMap((res: PagedResourceCollection<MoneyExchange>) => {
        console.log(
          `MoneyExchangeComponent: Fetching related processing reports for pair: ${this.sourceCurrency?.code} -> ${this.destCurrency?.code}`,
        );
        return this.moneyExchangeService
          .getExchangeReport(this.sourceCurrency, this.destCurrency)
          .pipe(
            switchMap((report: MoneyExchangeReport) => {
              console.log(
                'MoneyExchangeComponent: Exchange report payload successfully collected',
                report,
              );
              this.report = report;
              return of(res);
            }),
          );
      }),
    );
  };

  ngOnDestroy(): void {
    console.log(
      'MoneyExchangeComponent: Destroy hook triggered. Unsubscribing page parameters stream.',
    );
    this.pageSubscription?.unsubscribe();
  }
}
