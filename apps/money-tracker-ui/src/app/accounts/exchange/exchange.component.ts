import { AfterViewInit, Component, Inject, OnInit, ViewChild } from "@angular/core";
import { PagedResourceCollection, Sort } from "@lagoshny/ngx-hateoas-client";
import {
  MoneyExchange,
  MoneyExchangeReport,
  MoneyType
} from "@clematis-shared/model";

import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import {
  EntityListComponent,
  MoneyExchangeService,
  MoneyTypeService
} from "@clematis-shared/shared-components";

import { Observable, of, Subscription, switchMap, tap } from "rxjs";

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.sass'],
  providers: [
    { provide: 'searchService', useClass: MoneyExchangeService }
  ]
})
export class ExchangeComponent implements OnInit, AfterViewInit {

  @ViewChild(EntityListComponent) entityList!: EntityListComponent<MoneyExchange>;

  pageSubscription: Subscription | undefined;

  options: any;

  loading = false

  pageLoading = false

  sourceCurrency!: MoneyType;

  destCurrency!: MoneyType;

  currencies: MoneyType[] = [];

  displayedColumns: string[] = [
    'exchangedate',
    'from',
    'to',
    'sourceamount',
    'destamount',
    'rate'
  ];

  report?: MoneyExchangeReport;

  constructor(private moneyTypeService: MoneyTypeService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title,
              @Inject("searchService") private moneyExchangeService: MoneyExchangeService) {

    this.moneyExchangeService.setPostProcessingStream(this.postProcessingHandler)
  }

  ngOnInit(): void {
    this.title.setTitle('Currency Exchange')
  }

  ngAfterViewInit(): void {

    this.moneyTypeService.getPage({
      pageParams: {
        page: 0,
        size: 200
      },
    }).subscribe((response: PagedResourceCollection<MoneyType>) => {
      this.currencies = response.resources
      this.pageSubscription = this.route.queryParams.subscribe(

        (queryParam: any) => {
          this.initMoneyType(queryParam['source'], 'RUB')
            .subscribe((result: MoneyType) => {
              this.sourceCurrency = result

              this.initMoneyType(queryParam['dest'], 'USD')
                .subscribe((result: MoneyType) => {
                  this.destCurrency = result
                  this.loadData()
                })
            })
        }
      );
    })

  }

  getSourceCurrencies() {
    return this.currencies.filter((value: MoneyType) => {
      return value?.code !== this.destCurrency?.code
    })
  }

  initMoneyType(destCurrency: string, fallback: string) {
    if (!destCurrency) {
      destCurrency = fallback
    }
    return this.moneyTypeService.getCurrencyByCode(destCurrency)
  }

  getDestCurrencies() {
    return this.currencies.filter((value: MoneyType) => {
      return value?.code !== this.sourceCurrency?.code
    })
  }

  swapCurrencies() {
    const swap = this.sourceCurrency
    this.sourceCurrency = this.destCurrency
    this.destCurrency = swap
    this.updateRoute()
  }

  updatesSourceCurrency($event: MoneyType) {
    this.sourceCurrency = $event
    this.entityList.n = 0
    this.updateRoute()
  }

  updatesDestCurrency($event: MoneyType) {
    this.destCurrency = $event
    this.entityList.n = 0
    this.updateRoute()
  }

  updateRoute() {

    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.getQueryArguments()
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    })

  }

  private loadData() {

    if (this.sourceCurrency?.code && this.destCurrency?.code) {
      this.entityList.refreshData({
        queryArguments: this.getQueryArguments(),
        queryName: "events"
      });
    }
  }

  getQueryArguments(): any {
    if (this.sourceCurrency?.code && this.destCurrency?.code) {
      return {
        source: this.sourceCurrency?.code,
        dest: this.destCurrency?.code
      };
    } return {}
  }

  getSort(): Sort {
    return {
      exchangedate: 'DESC'
    }
  }

  setLoading($event: boolean) {
    this.loading = $event
  }

  postProcessingHandler = (res: PagedResourceCollection<MoneyExchange>):
    Observable<PagedResourceCollection<MoneyExchange>> => {

    return of(res).pipe(
      tap(() => this.moneyExchangeService.setProcessingStatusDescription("loading exchange report")),
      switchMap((res: PagedResourceCollection<MoneyExchange>) => {
        return this.moneyExchangeService.getExchangeReport(this.sourceCurrency, this.destCurrency)
          .pipe(switchMap((report: MoneyExchangeReport) => {
              this.report = report
              return of(res)
            })
          )
      })
    )
  }

}
