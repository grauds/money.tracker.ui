import { Component, Inject, Input, TemplateRef, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Entity, SearchStringMode } from "@clematis-shared/model";
import { EntityListComponent } from "../entity-list/entity-list.component";
import { Sort } from "@lagoshny/ngx-hateoas-client";
import { SearchService } from "../../service/search.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-search',
  templateUrl: './entity-list-filtered.component.html',
  styleUrls: ['./entity-list-filtered.component.sass']
})
export class EntityListFilteredComponent<T extends Entity> {

  @ViewChild(EntityListComponent) entityList!: EntityListComponent<T>;

  @Input() resultItemTemplate: TemplateRef<any> | undefined;

  @Input() table = false;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  name: FormControl = new FormControl();

  mode: SearchStringMode = SearchStringMode.Starting;

  modes: SearchStringMode[] = [
    SearchStringMode.Starting,
    SearchStringMode.Containing,
    SearchStringMode.Ending
  ]

  loading = false;

  public constructor(@Inject("searchService") private readonly searchService: SearchService<T>,
                     protected router: Router,
                     protected route: ActivatedRoute) {

    this.pageSubscription = route.queryParams.subscribe(
      (queryParams: Params) => {
        this.name.setValue(queryParams['name']);
      }
    )
  }

  getQueryName() {
    console.log("Get query name " + (this.name.value ? ('findByName' + this.mode) : null));
    return this.name.value ? ('findByName' + this.mode) : null;
  }

  setFilter($event: Map<string, string>) {
    this.name.setValue($event.get('name'));
    console.log("Set filter " + this.name.value);
    this.entityList.updateRouteAndLoadData()
  }

  setNameFilter($event: Event) {
    const element = $event.target as HTMLInputElement
    if (element.value) {
      this.entityList.setFilter(element.id, element.value)
    } else {
      this.entityList.removeFilter(element.id)
    }
    this.entityList.updateRouteAndLoadData()
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
