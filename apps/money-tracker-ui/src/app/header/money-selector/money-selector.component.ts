import { Component, OnInit, OnDestroy } from '@angular/core';
import { MoneyType } from '@clematis-shared/model';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Subscription, combineLatest } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MoneyTypeService } from '@clematis-shared/shared-components';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-money-selector',
  templateUrl: './money-selector.component.html',
  styleUrls: ['./money-selector.component.sass'],
  standalone: true,
  imports: [MatFormFieldModule, MatOptionModule, MatSelectModule],
})
export class MoneySelectorComponent implements OnInit, OnDestroy {

  private routeSubscription = new Subscription();

  message = '';

  loading = false;

  currency: MoneyType = this.moneyTypeService.getSelectedMoneyType();

  currencies: MoneyType[] = [];

  constructor(
    private resourceService: HateoasResourceService,
    private moneyTypeService: MoneyTypeService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Currencies');

    this.routeSubscription.add(
      combineLatest([
        this.route.queryParams,
        this.moneyTypeService.moneyTypes$,
      ]).subscribe(([queryParams, loadedCurrencies]) => {
        // Populate the UI dropdown options dynamically now that data is loaded
        this.currencies = loadedCurrencies;

        // Select currency from the address bar code
        const currencyCode: string = queryParams['currency'];

        if (currencyCode) {
          // Sync service selection with route parameter
          this.moneyTypeService.selectMoneyTypeByCode(currencyCode);
          this.currency =
            this.moneyTypeService.getCachedCurrencyByCode(currencyCode) ||
            this.moneyTypeService.getSelectedMoneyType();
        } else {
          // If no currency is declared in URL,
          // match with the default active state ('RUB')
          this.currency = this.moneyTypeService.getSelectedMoneyType();
        }
      }),
    );
  }

  onCurrencyChange(newCurrency: MoneyType) {
    this.currency = newCurrency;
    this.moneyTypeService.selectMoneyType(newCurrency);
    this.updateRoute();
  }

  updateRoute() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        currency: this.currency?.code,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
