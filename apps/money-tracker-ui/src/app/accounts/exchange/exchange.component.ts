import {Component, OnInit} from '@angular/core';
import {HateoasResourceService, PagedResourceCollection, Sort} from "@lagoshny/ngx-hateoas-client";
import {KeycloakService} from "keycloak-angular";
import {MoneyExchange, MoneyExchangeReport, MoneyTypes} from "@clematis-shared/model";
import {ActivatedRoute, Router} from "@angular/router";
import {EntityListComponent} from "@clematis-shared/shared-components";
import {Observable, of, switchMap} from "rxjs";
import {MoneyTrackerService} from "@clematis-shared/money-tracker-service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.sass'],
})
export class ExchangeComponent extends EntityListComponent<MoneyExchange> implements OnInit {

  isLoggedIn: boolean = false;

  options: any;

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

  constructor(private moneyTrackerService: MoneyTrackerService,
              resourceService: HateoasResourceService,
              protected readonly keycloak: KeycloakService,
              router: Router,
              route: ActivatedRoute,
              private title: Title) {

    super(MoneyExchange, resourceService, router, route)

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
  }

  override queryData(): Observable<PagedResourceCollection<MoneyExchange>> {
    return super.queryData().pipe(
       switchMap((arr: PagedResourceCollection<MoneyExchange>) => {
         return this.moneyTrackerService.getExchangeReport(this.sourceCurrency, this.destCurrency)
           .pipe(switchMap((report: MoneyExchangeReport) => {
             this.report = report
             return of(arr)
           }))
       })
    )
  }

  ngOnInit(): void {
    super._ngOnInit()
    this.title.setTitle('Money Exchange')
  }

  override getPage() {
    return this.doSearch()
  }

  override doSearch() {
    return this.resourceService.searchPage<MoneyExchange>(MoneyExchange, 'events', {
      pageParams: {
        page: this.n,
        size: this.limit
      },
      params: {
        source: this.sourceCurrency,
        dest: this.destCurrency
      },
      sort: this.getSortOption()
    });
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

  updatesSourceCurrency($event: MoneyTypes) {
    this.sourceCurrency = $event
    this.loadData()
    this.updateRoute()
  }

  updatesDestCurrency($event: MoneyTypes) {
    this.destCurrency = $event
    this.loadData()
    this.updateRoute()
  }

  override updateRoute() {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        source: this.sourceCurrency,
        dest: this.destCurrency,
        page: this.n,
        size: this.limit
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    })
  }

  override getSortOption() {
    let ret: Sort = {
      exchangeDate: 'DESC'
    }
    return ret
  }

  swapCurrencies() {
    const swap = this.sourceCurrency
    this.sourceCurrency = this.destCurrency
    this.destCurrency = swap
    this.loadData()
    this.updateRoute()
  }
}
