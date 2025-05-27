import { Component, Input } from '@angular/core';
import { CommoditiesService } from '@clematis-shared/shared-components';
import { RequestParam, Sort } from '@lagoshny/ngx-hateoas-client';
import { Entity } from '@clematis-shared/model';

@Component({
  selector: 'app-commodity-group-commodities',
  templateUrl: './commodity-group-commodities.component.html',
  styleUrls: ['./commodity-group-commodities.component.sass'],
  providers: [{ provide: 'searchService', useClass: CommoditiesService }],
  standalone: false,
})
export class CommodityGroupCommoditiesComponent {
  @Input() id = '';

  loading = false;

  children: Entity[] = [];

  setLoading($event: boolean) {
    this.loading = $event;
  }

  setEntities($event: Entity[]) {
    this.children = $event;
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
