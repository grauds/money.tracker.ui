import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Entity, Organization, OrganizationGroup } from '@clematis-shared/model';
import { EntityComponent, Utils } from '@clematis-shared/shared-components';
import { MoneyTrackerService } from "@clematis-shared/money-tracker-service";
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent extends EntityComponent<Organization> implements OnInit {

  currentRate: number = 2;

  parent: OrganizationGroup | undefined;

  parentLink: string | undefined;

  path: Array<OrganizationGroup> = [];

  constructor(resourceService: HateoasResourceService,
              private moneyTrackerService: MoneyTrackerService,
              route: ActivatedRoute,
              title: Title) {
    super(Organization, resourceService, route, title)
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
        this.moneyTrackerService.getPathForOrganizationGroup(Utils.getIdFromSelfUrl(this.parent))
          .subscribe((response) => {
          this.path = response.resources
          if (this.parent) {
            this.path.push(this.parent)
          }
        }, (error) => {
          // todo error handling
        })
      })
  }
}
