import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';

import { Entity, Organization, OrganizationGroup } from '@clematis-shared/model';
import { EntityComponent } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent extends EntityComponent<Organization> implements OnInit {

  currentRate: number = 2;

  parent: OrganizationGroup | undefined;

  parentLink: string | undefined;

  constructor(resourceService: HateoasResourceService,
              route: ActivatedRoute) {
    super(Organization, resourceService, route)
  }

  ngOnInit(): void {
    this.onInit()
  }

  override setEntity(entity: Organization) {
    super.setEntity(entity)

    this.entity?.getRelation<OrganizationGroup>('parent')
      .subscribe((parent: OrganizationGroup) => {
        this.parent = parent
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent)
      })
  }
}
