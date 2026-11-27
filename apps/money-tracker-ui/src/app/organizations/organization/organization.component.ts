import { Component, OnDestroy, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
} from '@lagoshny/ngx-hateoas-client';
import {
  Organization,
  OrganizationGroup,
  ExpenseItem,
  IncomeItem
} from '@clematis-shared/model';
import {
  EntityComponent,
  ExpenseItemsService,
  IncomeItemsService,
  StorageService,
  PhotoUploaderComponent,
  RESOURCE_TYPE,
  PARENT_RESOURCE_TYPE,
  EntityService,
  MoneyTypeService
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.sass'],
  providers: [
    EntityService,
    { provide: RESOURCE_TYPE, useValue: Organization },
    { provide: PARENT_RESOURCE_TYPE, useValue: OrganizationGroup },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class OrganizationComponent
  extends EntityComponent<Organization, OrganizationGroup>
  implements OnDestroy
{
  statsLoading = true;

  image: PhotoUploaderComponent | undefined;

  income: IncomeItem[] = [];

  expenses: ExpenseItem[] = [];

  constructor(
    resourceService: HateoasResourceService,
    public readonly expenseService: ExpenseItemsService,
    public readonly incomeService: IncomeItemsService,
    protected override readonly moneyTypeService: MoneyTypeService,
    entityService: EntityService<Organization, OrganizationGroup>,
    private readonly uploadService: StorageService,
    route: ActivatedRoute,
    router: Router,
    title: Title,
  ) {
    super(
      Organization,
      resourceService,
      moneyTypeService,
      route,
      router,
      title,
      entityService,
    );
    this.image = new PhotoUploaderComponent(this.uploadService);
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  override onEntityLoaded(entity: Organization) {
    this.statsLoading = false;
  }

  setIncome($event: IncomeItem[]) {
    setTimeout(() => {
      this.income = $event;
    });
  }

  setExpenses($event: ExpenseItem[]) {
    setTimeout(() => {
      this.expenses = $event;
    });
  }

  getMapUrl(address: string): string {
    return `https://yandex.ru/maps/?text=${encodeURIComponent(
      this.normalizeUrl(address)
    )
    }`;
  }

  normalizeUrl(url: string): string {
    const trimmed = url.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }

  formatUrlDisplay(url: string): string {
    return url
      .trim()
      .replace(/^https?:\/\/(www\.)?/i, '')
      .replace(/\/$/, '');
  }
}
