import { Component, OnInit } from '@angular/core';
import { EntityListComponent} from '../../common/widgets/entity-list/entity-list.component';
import { CommodityGroup } from '../../common/model/commodity-group';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-commodity-group-list',
  templateUrl: './../../common/widgets/entity-list/entity-list.component.html',
  styleUrls: ['./../../common/widgets/entity-list/entity-list.component.css']
})
export class CommodityGroupListComponent extends EntityListComponent<CommodityGroup> implements OnInit {

  constructor(resourceService: HateoasResourceService, route: ActivatedRoute) {
    super(CommodityGroup, resourceService, route)

    this.path = 'commodityGroups'
  }

  ngOnInit(): void {
    super.onInit()
  }

}
