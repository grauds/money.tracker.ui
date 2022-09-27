import { Component, OnInit } from '@angular/core';
import { EntityListComponent} from '../../common/widgets/entity-list/entity-list.component';
import { OrganizationGroup } from '../../common/model/organization-group';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-organization-group-list',
  templateUrl: './../../common/widgets/entity-list/entity-list.component.html',
  styleUrls: ['./../../common/widgets/entity-list/entity-list.component.css']
})
export class OrganizationGroupListComponent extends EntityListComponent<OrganizationGroup> implements OnInit {

  constructor(resourceService: HateoasResourceService, route: ActivatedRoute) {
    super(OrganizationGroup, resourceService, route)

    this.path = 'organizationGroups'
  }

  ngOnInit(): void {
    super.onInit()
  }
}
