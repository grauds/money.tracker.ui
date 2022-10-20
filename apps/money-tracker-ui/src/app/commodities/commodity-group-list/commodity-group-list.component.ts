import { Component, OnInit } from '@angular/core';
import { EntityListComponent} from '@clematis-shared/shared-components';
import { CommodityGroup } from '@clematis-shared/model';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-commodity-group-list',
  templateUrl: 'commodity-group-list.component.html',
  styleUrls: ['commodity-group-list.component.css']
})
export class CommodityGroupListComponent extends EntityListComponent<CommodityGroup> implements OnInit {

  constructor(resourceService: HateoasResourceService, router: Router, route: ActivatedRoute) {
    super(CommodityGroup, resourceService, router, route)

    this.path = 'commodityGroups'
  }

  ngOnInit(): void {
    super.onInit()
  }
}
