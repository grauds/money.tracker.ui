import { Component, Input, OnInit } from '@angular/core';
import { Entity } from '@clematis-shared/model';
import { Router } from '@angular/router';
import { Resource } from "@lagoshny/ngx-hateoas-client";

@Component({
  selector: 'app-entity-element',
  templateUrl: './entity-element.component.html',
  styleUrls: ['./entity-element.component.sass']
})
export class EntityElementComponent<T extends Resource> implements OnInit {

  @Input() entity: T | undefined;

  entityLink: string | undefined;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.entityLink = Entity.getRelativeSelfLinkHref(this.entity)
  }

  navigate = () => {
    this.router.navigate([this.entityLink])
  }

}
