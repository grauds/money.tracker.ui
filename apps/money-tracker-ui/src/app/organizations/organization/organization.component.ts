import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Organization, OrganizationGroup } from '@clematis-shared/model';

import { EntityComponent } from '../../common/widgets/entity/entity.component';
import { Utils } from '../../common/utils/utils';

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
        this.parentLink = Utils.parseResourceUrlToAppUrl(this.parent.getSelfLinkHref())
      })
  }
}
