import { Component, OnInit } from '@angular/core';
import { EntityListComponent } from '../../common/widgets/entity-list/entity-list.component';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Commodity } from '@clematis-shared/model';

@Component({
  selector: 'app-commodities-list',
  templateUrl: './../../common/widgets/entity-list/entity-list.component.html',
  styleUrls: ['./../../common/widgets/entity-list/entity-list.component.css']
})
export class CommoditiesListComponent extends EntityListComponent<Commodity> implements OnInit {

  constructor(resourceService: HateoasResourceService, router: Router, route: ActivatedRoute) {
    super(Commodity, resourceService, router, route)

    this.path = 'commodities'
  }

  ngOnInit(): void {
    super.onInit()
  }

}
