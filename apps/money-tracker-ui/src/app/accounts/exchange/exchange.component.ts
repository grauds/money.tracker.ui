import {Component, OnInit} from '@angular/core';
import {HateoasResourceService} from "@lagoshny/ngx-hateoas-client";
import {KeycloakService} from "keycloak-angular";
import {MoneyTypes, MoneyExchange} from "@clematis-shared/model";
import {ActivatedRoute, Router} from "@angular/router";
import {EntityListComponent} from "@clematis-shared/shared-components";

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css'],
})
export class ExchangeComponent extends EntityListComponent<MoneyExchange> implements OnInit {

  isLoggedIn: boolean = false;

  options: any;

  sourceCurrency: MoneyTypes = MoneyTypes.RUB;

  destCurrency: MoneyTypes = MoneyTypes.USD;

  currencies = [MoneyTypes.RUB,
    MoneyTypes.GBP,
    MoneyTypes.EUR,
    MoneyTypes.USD
  ];

  displayedColumns: string[] = ['exchangedate', 'from', 'to', 'amount', 'rate'];

  constructor(resourceService: HateoasResourceService,
              protected readonly keycloak: KeycloakService,
              router: Router,
              route: ActivatedRoute) {

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
        this.ngOnInit();
      }
    );

    this.path = 'exchange'

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

  ngOnInit() {
     this.onInit()
  }
}
