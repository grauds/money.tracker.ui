import { Component, Input, OnInit } from '@angular/core';
import { Entity } from '@clematis-shared/model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-entity-element',
  templateUrl: './entity-element.component.html',
  styleUrls: ['./entity-element.component.sass'],
  standalone: false
})
export class EntityElementComponent<T extends Entity> implements OnInit {
  @Input() entity?: T;

  entityLink: string | undefined;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.entityLink = Entity.getRelativeSelfLinkHref(this.entity);
  }

  navigate = () => {
    this.router.navigate([this.entityLink]);
  };
}
