import { Component, OnInit } from '@angular/core';
import { OrganizationGroup } from '@clematis-shared/model';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityListComponent} from '../../common/widgets/entity-list/entity-list.component';

@Component({
  selector: 'app-organization-group-list',
  templateUrl: './../../common/widgets/entity-list/entity-list.component.html',
  styleUrls: ['./../../common/widgets/entity-list/entity-list.component.css']
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
