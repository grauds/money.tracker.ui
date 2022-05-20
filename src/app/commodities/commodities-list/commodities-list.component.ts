import { Component, OnInit } from '@angular/core';
import { EntityListComponent } from '../../common/widgets/entity-list/entity-list.component';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute } from '@angular/router';
import { Commodity } from '../../common/model/commodity';

@Component({
  selector: 'app-commodities-list',
  templateUrl: './../../common/widgets/entity-list/entity-list.component.html',
  styleUrls: ['./../../common/widgets/entity-list/entity-list.component.css']
})
export class CommoditiesListComponent extends EntityListComponent<Commodity> implements OnInit {

  constructor(resourceService: HateoasResourceService, route: ActivatedRoute) {
    super(Commodity, resourceService, route)

    this.path = 'commodities'
  }

  ngOnInit(): void {
    super.onInit()
  }

}
