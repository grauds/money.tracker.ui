import { Component, OnInit } from '@angular/core';
import { HateoasResourceService, ResourceCollection } from '@lagoshny/ngx-hateoas-client';
import {ActivatedRoute, Router} from '@angular/router';

import { CommodityGroup, Entity, Organization, OrganizationGroup } from '@clematis-shared/model';
import { MoneyTrackerService } from '@clematis-shared/money-tracker-service';
import {EntityComponent, OrganizationsService} from '@clematis-shared/shared-components';
import {Title} from "@angular/platform-browser";
import { Utils } from '@clematis-shared/model';

@Component({
  selector: 'app-organization-group',
  templateUrl: './organization-group.component.html',
  styleUrls: ['./organization-group.component.css'],
  providers: [
    { provide: 'searchService', useClass: OrganizationsService }
  ]
})
export class OrganizationGroupComponent extends EntityComponent<OrganizationGroup> implements OnInit {

  currentRate: number = 2;

  loading: boolean = true;

  parent: OrganizationGroup | undefined;

  parentLink: string | undefined;

  childGroups: OrganizationGroup[] = []

  childOrganizations: Organization[] = []

  path: Array<CommodityGroup> = [];

  constructor(resourceService: HateoasResourceService,
              private moneyTrackerService: MoneyTrackerService,
              route: ActivatedRoute,
              router: Router,
              title: Title) {
    super(OrganizationGroup, resourceService, route, router, title);
  }

  ngOnInit(): void {
    this.onInit()
  }

  override setEntity(entity: OrganizationGroup) {
    super.setEntity(entity)

    this.entity?.getRelation<OrganizationGroup>('parent')
      .subscribe((parent: OrganizationGroup) => {
        this.parent = parent
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent)
      })

    this.resourceService.searchCollection(OrganizationGroup, 'recursiveByParentId', {
      params: {
        id: this.id ? this.id : '1'
      }
    })
      .subscribe((collection: ResourceCollection<OrganizationGroup>) => {
        this.childGroups = collection.resources;
      });

    this.resourceService.searchCollection(Organization, 'recursiveByParentGroupId', {
      params: {
        id: this.id ? this.id : '1'
      }
    })
      .subscribe((collection: ResourceCollection<Organization>) => {
        this.childOrganizations = collection.resources;
      });

    if (this.entity) {
      this.moneyTrackerService.getPathForOrganizationGroup(Utils.getIdFromSelfUrl(this.entity)).subscribe((response) => {
        this.path = response.resources
      })
    }

  }
}
