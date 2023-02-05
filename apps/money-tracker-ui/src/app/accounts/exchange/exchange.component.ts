import { Component, OnInit } from '@angular/core';
import { Sort } from "@lagoshny/ngx-hateoas-client";
import { KeycloakService } from "keycloak-angular";
import { MoneyExchangeReport, MoneyTypes } from "@clematis-shared/model";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { MoneyExchangeService } from "@clematis-shared/shared-components";
import { Subscription } from "rxjs";

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

  loading: boolean = false;

  pageLoading: boolean = false;

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

  constructor(protected readonly keycloak: KeycloakService,
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
    this.updateRoute()
  }

  updatesDestCurrency($event: MoneyTypes) {
    this.destCurrency = $event
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
  }

  getQueryName(): string | null {
    return 'events';
  }

  getQueryArguments(): any {
    return {
      params: {
        source: this.sourceCurrency,
        dest: this.destCurrency
      }
    };
  }

  getSort() {
    let ret: Sort = {
      exchangeDate: 'DESC'
    }
    return ret
  }

  swapCurrencies() {
    const swap = this.sourceCurrency
    this.sourceCurrency = this.destCurrency
    this.destCurrency = swap
    this.updateRoute()
  }

  setLoading($event: boolean) {
    this.loading = $event
  }

  setPageLoading($event: boolean) {
    this.pageLoading = $event
  }

}
