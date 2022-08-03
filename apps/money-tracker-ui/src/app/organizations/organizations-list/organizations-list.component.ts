import { Component, OnInit } from '@angular/core';
import { EntityListComponent } from '../../common/widgets/entity-list/entity-list.component';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute } from '@angular/router';
import { Organization } from '../../common/model/organization';

@Component({
  selector: 'app-organizations-list',
  templateUrl: './../../common/widgets/entity-list/entity-list.component.html',
  styleUrls: ['./../../common/widgets/entity-list/entity-list.component.css']
})
export class OrganizationsListComponent extends EntityListComponent<Organization> implements OnInit {

  constructor(resourceService: HateoasResourceService, route: ActivatedRoute) {
    super(Organization, resourceService, route)

    this.path = 'organizations'
  }

  ngOnInit(): void {
    super.onInit()
  }

}
