import { Component, ViewChild } from '@angular/core';
import {
  AccountGroupService,
  EntityComponent,
  EntityListComponent,
  EntityService,
  MoneyTypeService,
  PARENT_RESOURCE_TYPE,
  RESOURCE_TYPE
} from '@clematis-shared/shared-components';
import { AccountGroup, Entity } from '@clematis-shared/model';
import { HateoasResourceService, RequestParam, Sort } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-account-group',
  templateUrl: './account-group.component.html',
  styleUrl: './account-group.component.sass',
  providers: [
    { provide: 'searchService', useClass: AccountGroupService },
    EntityService,
    { provide: RESOURCE_TYPE, useValue: AccountGroup },
    { provide: PARENT_RESOURCE_TYPE, useValue: AccountGroup },
  ],
  standalone: false,
})
export class AccountGroupComponent extends EntityComponent<
  AccountGroup,
  AccountGroup
> {
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<AccountGroup>;

  children: Entity[] = [];

  constructor(
    resourceService: HateoasResourceService,
    protected override moneyTypeService: MoneyTypeService,
    entityService: EntityService<AccountGroup, AccountGroup>,
    route: ActivatedRoute,
    router: Router,
    title: Title,
  ) {
    super(
      AccountGroup,
      resourceService,
      moneyTypeService,
      route,
      router,
      title,
      entityService,
    );
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  setEntities($event: AccountGroup[]) {
    setTimeout(() => {
      this.children = $event;
    });
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
