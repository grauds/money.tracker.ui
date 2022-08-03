import { Component, Input, OnInit } from '@angular/core';
import { Entity } from '../../model/entity';
import {Utils} from "../../utils/utils";

@Component({
  selector: 'app-entity-element',
  templateUrl: './entity-element.component.html',
  styleUrls: ['./entity-element.component.css']
})
export class EntityElementComponent implements OnInit {

  @Input() entity: Entity = new Entity();

  entityLink: string | undefined;

  constructor() { }

  ngOnInit(): void {
    this.entityLink = Utils.parseResourceUrlToAppUrl(this.entity.getSelfLinkHref())
  }

}
