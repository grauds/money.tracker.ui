import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { PagedResourceCollection, Sort } from "@lagoshny/ngx-hateoas-client";
import { KeycloakService } from "keycloak-angular";
import { MoneyExchange, MoneyExchangeReport, MoneyTypes } from "@clematis-shared/model";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import {
  EntityListComponent,
  MoneyExchangeService
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
export class ExchangeComponent implements OnInit {

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  isLoggedIn: boolean = false;

  options: any;

  loading = false

  pageLoading = false

  sourceCurrency: MoneyTypes = MoneyTypes.RUB;

  destCurrency: MoneyTypes = MoneyTypes.USD;

  currencies = [MoneyTypes.RUB,
    MoneyTypes.GBP,
    MoneyTypes.EUR,
    MoneyTypes.USD,
    MoneyTypes.CZK
  ];

  displayedColumns: string[] = ['exchangedate', 'from', 'to', 'sourceamount', 'destamount', 'rate'];

  report?: MoneyExchangeReport;

  @ViewChild(EntityListComponent) entityList!: EntityListComponent<MoneyExchange>;

  constructor(protected readonly keycloak: KeycloakService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title,
              @Inject("searchService") private moneyExchangeService: MoneyExchangeService) {

    this.keycloak.isLoggedIn().then((logged) => {
      this.isLoggedIn = logged
    })

    this.pageSubscription = route.queryParams.subscribe(
      (queryParam: any) => {
        const sourceCurrency: String = queryParam['source']
        if (sourceCurrency) {
          this.sourceCurrency = MoneyTypes[sourceCurrency as keyof typeof MoneyTypes]
        }
        const destCurrency: String = queryParam['dest']
        if (destCurrency) {
          this.destCurrency = MoneyTypes[destCurrency as keyof typeof MoneyTypes]
        }
      }
    );

    this.moneyExchangeService.setPostProcessingStream(this.postProcessingHandler)
  }

  ngOnInit(): void {
    this.title.setTitle('Currency Exchange')
  }

  getSourceCurrencies() {
    return this.currencies.filter((value: MoneyTypes) => {
      return value !== this.destCurrency
    })
  }

  getDestCurrencies() {
    return this.currencies.filter((value: MoneyTypes) => {
      return value !== this.sourceCurrency
    })
  }

  swapCurrencies() {
    const swap = this.sourceCurrency
    this.sourceCurrency = this.destCurrency
    this.destCurrency = swap
    this.updateRoute()
  }

  updatesSourceCurrency($event: MoneyTypes) {
    this.sourceCurrency = $event
    this.entityList.n = 0
    this.updateRoute()
  }

  updatesDestCurrency($event: MoneyTypes) {
    this.destCurrency = $event
    this.entityList.n = 0
    this.updateRoute()
  }

  updateRoute() {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.getQueryArguments()
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    })

    this.entityList.pageLoading$.next(true)
    this.entityList.searchRequest$.next(this.getQueryArguments())
  }

  getQueryName(): string {
    return 'events';
  }

  getQueryArguments(): any {
    return {
      source: this.sourceCurrency,
      dest: this.destCurrency
    };
  }

  getSort() {
    let ret: Sort = {
      exchangedate: 'DESC'
    }
    return ret
  }

  setLoading($event: boolean) {
    this.loading = $event
  }

  setPageLoading($event: boolean) {
    this.pageLoading = $event
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
