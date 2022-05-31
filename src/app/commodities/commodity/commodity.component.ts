import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { EntityComponent } from '../../common/widgets/entity/entity.component';
import { Commodity } from '../../common/model/commodity';

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.css']
})
export class CommodityComponent extends EntityComponent<Commodity> implements OnInit {

  images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);

  constructor(resourceService: HateoasResourceService,
              route: ActivatedRoute) {
    super(Commodity, resourceService, route);
  }

  ngOnInit(): void {
    this.onInit()
  }

}
