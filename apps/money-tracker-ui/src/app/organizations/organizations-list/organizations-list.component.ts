import { Component, OnInit } from '@angular/core';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Organization } from '@clematis-shared/model';

import { EntityListComponent } from '../../common/widgets/entity-list/entity-list.component';

@Component({
  selector: 'app-organizations-list',
  templateUrl: './../../common/widgets/entity-list/entity-list.component.html',
  styleUrls: ['./../../common/widgets/entity-list/entity-list.component.css']
})
export class OrganizationsListComponent extends EntityListComponent<Organization> implements OnInit {

  constructor(resourceService: HateoasResourceService, router: Router, route: ActivatedRoute) {
    super(Organization, resourceService, router, route)

    this.path = 'organizations'
  }

  ngOnInit(): void {
    super.onInit()
  }

}
