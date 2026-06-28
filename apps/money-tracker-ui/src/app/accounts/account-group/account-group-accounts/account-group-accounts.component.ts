import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AccountsService, SharedComponentsModule } from '@clematis-shared/shared-components';
import { RequestParam, Sort } from '@lagoshny/ngx-hateoas-client';
import { Entity } from '@clematis-shared/model';

@Component({
  selector: 'app-account-group-accounts',
  templateUrl: './account-group-accounts.component.html',
  styleUrl: './account-group-accounts.component.sass',
  providers: [{ provide: 'searchService', useClass: AccountsService }],
  standalone: false,
})
export class AccountGroupAccountsComponent implements OnChanges {
  @Input() id = '';

  loading = false;

  children: Entity[] = [];

  searchRequest!: {
    queryArguments: RequestParam;
    queryName: string;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['id']) {
      this.updateSearchRequest();
    }
  }

  updateSearchRequest() {
    this.searchRequest = {
      queryArguments: {
        id: this.id ? this.id : '',
      },
      queryName: 'recursiveAccountsByGroupId',
    };
  }

  setLoading($event: boolean) {
    this.loading = $event;
  }

  setEntities($event: Entity[]) {
    setTimeout(() => {
      this.children = $event;
    });
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
