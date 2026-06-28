import { Component } from '@angular/core';
import {
  EntityComponent,
  EntityService, ExpenseItemsService, IncomeItemsService, MoneyTypeService,
  PARENT_RESOURCE_TYPE,
  RESOURCE_TYPE
} from '@clematis-shared/shared-components';
import {
  Account,
  AccountGroup,
  Commodity,
  ExpenseItem,
  IncomeItem
} from '@clematis-shared/model';
import { HateoasResourceService, RequestParam } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-account',
  providers: [
    EntityService,
    { provide: RESOURCE_TYPE, useValue: Account },
    { provide: PARENT_RESOURCE_TYPE, useValue: AccountGroup },
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.sass',
  standalone: false,
})
export class AccountComponent extends EntityComponent<Account, AccountGroup> {
  income: IncomeItem[] = [];

  expenses: ExpenseItem[] = [];

  constructor(
    resourceService: HateoasResourceService,
    public readonly expenseService: ExpenseItemsService,
    public readonly incomeService: IncomeItemsService,
    protected override moneyTypeService: MoneyTypeService,
    entityService: EntityService<Account, AccountGroup>,
    route: ActivatedRoute,
    router: Router,
    title: Title,
  ) {
    super(
      Account,
      resourceService,
      moneyTypeService,
      route,
      router,
      title,
      entityService,
    );
  }

  override onEntityLoaded(entity: Commodity) {
    if (!entity) {
      return;
    }
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
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
}
