import { Component, Input } from '@angular/core';
import { Entity } from '@clematis-shared/model';
import { RequestParam, Sort } from '@lagoshny/ngx-hateoas-client';
import { OrganizationsService } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-organization-group-organizations',
  templateUrl: './organization-group-organizations.component.html',
  styleUrls: ['./organization-group-organizations.component.sass'],
  providers: [{ provide: 'searchService', useClass: OrganizationsService }],
})
export class OrganizationGroupOrganizationsComponent {
  @Input() id = '';

  loading: boolean = false;

  children: Entity[] = [];

  setLoading($event: boolean) {
    this.loading = $event;
  }

  setEntities($event: Entity[]) {
    this.children = $event;
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
