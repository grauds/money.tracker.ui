import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OrganizationsService } from '@clematis-shared/shared-components';
import { RequestParam, Sort } from '@lagoshny/ngx-hateoas-client';
import { Entity } from '@clematis-shared/model';

@Component({
  selector: 'app-organization-group-organizations',
  templateUrl: './organization-group-organizations.component.html',
  styleUrls: ['./organization-group-organizations.component.sass'],
  providers: [{ provide: 'searchService', useClass: OrganizationsService }],
  standalone: false,
})
export class OrganizationGroupOrganizationsComponent implements OnChanges {
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
      queryName: 'recursiveByParentGroupId',
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
