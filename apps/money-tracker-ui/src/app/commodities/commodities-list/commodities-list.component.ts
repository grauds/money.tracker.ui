import { Component, OnInit } from '@angular/core';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Commodity } from '@clematis-shared/model';
import { EntityListComponent } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-commodities-list',
  templateUrl: 'commodities-list.component.html',
  styleUrls: ['commodities-list.component.css']
})
export class CommoditiesListComponent extends EntityListComponent<Commodity> implements OnInit {

  constructor(resourceService: HateoasResourceService, router: Router, route: ActivatedRoute) {
    super(Commodity, resourceService, router, route)

    this.path = 'commodities'
  }

  ngOnInit(): void {
    super._ngOnInit()
  }

}
