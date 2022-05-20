import { Component, Input, OnInit } from '@angular/core';
import { Entity } from '../../model/entity';

@Component({
  selector: 'app-entity-element',
  templateUrl: './entity-element.component.html',
  styleUrls: ['./entity-element.component.css']
})
export class EntityElementComponent implements OnInit {

  @Input() entity: Entity = new Entity();

  constructor() { }

  ngOnInit(): void {
  }

}
