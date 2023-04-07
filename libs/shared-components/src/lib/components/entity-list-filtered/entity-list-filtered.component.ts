import { Component, Input, TemplateRef, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Entity, SearchStringMode } from "@clematis-shared/model";
import { EntityListComponent } from "../entity-list/entity-list.component";
import { Sort } from "@lagoshny/ngx-hateoas-client";

@Component({
  selector: 'app-search',
  templateUrl: './entity-list-filtered.component.html',
  styleUrls: ['./entity-list-filtered.component.sass']
})
export class EntityListFilteredComponent<T extends Entity> {

  @Input() resultItemTemplate: TemplateRef<any> | undefined;

  @Input() table = false;

  name: FormControl = new FormControl();

  mode: SearchStringMode = SearchStringMode.Starting;

  modes: SearchStringMode[] = [
    SearchStringMode.Starting,
    SearchStringMode.Containing,
    SearchStringMode.Ending
  ]

  loading = false;

  @ViewChild(EntityListComponent) entityList!: EntityListComponent<T>;

  setNameFilter($event: Event) {
    const element = $event.target as HTMLInputElement
    if (element.value) {
      this.entityList.setFilter(element.id, element.value)
    } else {
      this.entityList.removeFilter(element.id)
    }
    this.entityList.startLoadingData()
  }

  getQueryName() {
    return 'findByName' + this.mode;
  }

  setFilter($event: Map<string, string>) {
    this.name.setValue($event.get('name'));
  }

  setLoading($event: boolean) {
    this.loading = $event.valueOf()
  }

  updateSearchMode($event: SearchStringMode) {
    this.mode = $event
  }

  getSort(): Sort {
    return {
      name: 'ASC'
    }
  }
}
