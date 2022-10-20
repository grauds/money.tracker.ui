import { Component, Input, OnInit } from '@angular/core';
import { Entity } from '@clematis-shared/model';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.sass'],
})
export class BreadcrumbsComponent implements OnInit {

  @Input() path: Array<Entity> | null = null

  constructor() {}

  ngOnInit(): void {}

  parseResourceUrlToAppUrl(entity: Entity) {
    return Entity.getRelativeSelfLinkHref(entity);
  }
}
