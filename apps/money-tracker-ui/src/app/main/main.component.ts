import { Component, OnInit } from '@angular/core';
import { MoneyTypes } from '@clematis-shared/model';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Subscription } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  standalone: false,
})
export class MainComponent implements OnInit {
  isLoggedIn?: boolean;

  // total number of elements
  total = 0;

  // number of records per page
  limit = 12;

  // current page number counter
  n: number | undefined = undefined;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  message = '';

  loading = false;

  currency: MoneyTypes = MoneyTypes.RUB;

  currencies = [MoneyTypes.RUB, MoneyTypes.GBP, MoneyTypes.EUR, MoneyTypes.USD];

  constructor(
    private resourceService: HateoasResourceService,
    protected readonly keycloak: KeycloakService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title
  ) {
    this.isLoggedIn = this.keycloak.isLoggedIn();

    this.pageSubscription = route.queryParams.subscribe((queryParam: any) => {
      const page = Number.parseInt(queryParam['page'], 10);
      this.n = isNaN(page) ? undefined : page;
      const size = Number.parseInt(queryParam['size'], 10);
      this.limit = isNaN(size) ? 12 : size;
      const currency: string = queryParam['currency'];
      if (currency) {
        this.currency = MoneyTypes[currency as keyof typeof MoneyTypes];
      }
      this.ngOnInit();
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Currencies');
  }

  setCurrentPage(pageIndex: number, pageSize: number) {
    this.n = pageIndex;
    this.limit = pageSize;
  }

  updateRoute() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.n,
        size: this.limit,
        currency: this.currency,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
