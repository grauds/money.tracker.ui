import { Component, Input } from '@angular/core';
import { Entity } from '@clematis-shared/model';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.sass'],
})
export class BreadcrumbsComponent {
  @Input() path: Array<Entity> | null = null;

  parseResourceUrlToAppUrl(entity: Entity) {
    return Entity.getRelativeSelfLinkHref(entity);
  }
}
