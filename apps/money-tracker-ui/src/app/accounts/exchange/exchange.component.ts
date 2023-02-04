import { Component, OnInit } from '@angular/core';
import { Sort } from "@lagoshny/ngx-hateoas-client";
import { KeycloakService } from "keycloak-angular";
import { MoneyExchangeReport, MoneyTypes } from "@clematis-shared/model";
import { ActivatedRoute, Router } from "@angular/router";
import { MoneyTrackerService } from "@clematis-shared/money-tracker-service";
import { Title } from "@angular/platform-browser";
import { MoneyExchangeService } from "@clematis-shared/shared-components";

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.sass'],
  providers: [
    { provide: 'searchService', useClass: MoneyExchangeService }
  ]
})
export class ExchangeComponent implements OnInit {

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
              protected readonly keycloak: KeycloakService,
              private router: Router,
              private route: ActivatedRoute,
              private title: Title) {

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

  ngOnInit(): void {
    this.title.setTitle('Money Exchange')
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

  updateRoute() {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.n,
        size: this.limit,
        ...this.getQueryArguments()
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    })
  }

  override getQueryName(): string | null {
    return 'events';
  }

  override getQueryArguments(): any {
    return {
      params: {
        source: this.sourceCurrency,
        dest: this.destCurrency
      }
    };
  }

  override getSort() {
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
