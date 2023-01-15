import { Component, OnInit } from '@angular/core';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Organization } from '@clematis-shared/model';

import { EntityListComponent } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-organizations-list',
  templateUrl: 'organizations-list.component.html',
  styleUrls: ['organizations-list.component.css']
})
export class OrganizationsListComponent extends EntityListComponent<Organization> implements OnInit {

  constructor(resourceService: HateoasResourceService, router: Router, route: ActivatedRoute) {
    super(Organization, resourceService, router, route)

    this.path = 'organizations'
  }

  ngOnInit(): void {
    super._ngOnInit()
  }

}
