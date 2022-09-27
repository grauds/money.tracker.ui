import { Component, OnInit } from '@angular/core';
import {HateoasResourceService, ResourceCollection} from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute } from '@angular/router';
import { EntityComponent } from '../../common/widgets/entity/entity.component';
import { OrganizationGroup } from '../../common/model/organization-group';
import { Utils } from '../../common/utils/utils';
import { Organization } from '../../common/model/organization';

@Component({
  selector: 'app-organization-group',
  templateUrl: './organization-group.component.html',
  styleUrls: ['./organization-group.component.css'],
})
export class OrganizationGroupComponent extends EntityComponent<OrganizationGroup> implements OnInit {

  currentRate: number = 2;

  parent: OrganizationGroup | undefined;

  parentLink: string | undefined;

  childGroups: OrganizationGroup[] = []

  childOrganizations: Organization[] = []

  constructor(resourceService: HateoasResourceService,
              route: ActivatedRoute) {
    super(OrganizationGroup, resourceService, route);
  }

  ngOnInit(): void {
    this.onInit()
  }

  override setEntity(entity: OrganizationGroup) {
    super.setEntity(entity)

    this.entity?.getRelation<OrganizationGroup>('parent')
      .subscribe((parent: OrganizationGroup) => {
        this.parent = parent
        this.parentLink = Utils.parseResourceUrlToAppUrl(this.parent.getSelfLinkHref())
      })

    this.resourceService.searchCollection(OrganizationGroup, 'recursiveByParentId', {
      params: {
        id: this.id ? this.id : '1'
      }
    })
      .subscribe((collection: ResourceCollection<OrganizationGroup>) => {
        this.childGroups = collection.resources;
      });

    this.resourceService.searchCollection(Organization, 'recursiveByParentId', {
      params: {
        id: this.id ? this.id : '1'
      }
    })
      .subscribe((collection: ResourceCollection<Organization>) => {
        this.childOrganizations = collection.resources;
      });

  }
}
