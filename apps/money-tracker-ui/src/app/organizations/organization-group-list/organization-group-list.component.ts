import { Component, OnInit } from '@angular/core';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';

import { OrganizationGroup } from '@clematis-shared/model';
import { EntityListComponent} from '@clematis-shared/shared-components';

@Component({
  selector: 'app-organization-group-list',
  templateUrl: 'organization-group-list.component.html',
  styleUrls: ['organization-group-list.component.css']
})
export class OrganizationGroupListComponent extends EntityListComponent<OrganizationGroup> implements OnInit {

  constructor(resourceService: HateoasResourceService, router: Router, route: ActivatedRoute) {
    super(OrganizationGroup, resourceService, router, route)

    this.path = 'organizationGroups'
  }

  ngOnInit(): void {
    super.onInit()
  }
}
