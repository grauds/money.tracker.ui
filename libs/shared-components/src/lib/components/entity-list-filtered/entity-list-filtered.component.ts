import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationExtras,
  Params,
  Router,
} from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Sort } from '@lagoshny/ngx-hateoas-client';

import { Entity, SearchStringMode } from '@clematis-shared/model';
import { EntityListComponent } from '../entity-list/entity-list.component';
import { SearchService } from '../../service/search.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-search',
  templateUrl: './entity-list-filtered.component.html',
  styleUrls: ['./entity-list-filtered.component.sass'],
  standalone: false
})
export class EntityListFilteredComponent<T extends Entity>
  implements AfterViewInit
{
  @ViewChild(EntityListComponent) entityList!: EntityListComponent<T>;

  @Input() resultItemTemplate: TemplateRef<any> | undefined;

  @Input() table = false;

  @Input() queryParamsMode: 'merge' | 'preserve' | '' | null = 'merge';

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  name: FormControl = new FormControl();

  mode: FormControl<SearchStringMode | null> =
    new FormControl<SearchStringMode>(SearchStringMode.Starting);

  modes: SearchStringMode[] = [
    SearchStringMode.Starting,
    SearchStringMode.Containing,
    SearchStringMode.Ending,
  ];

  loading = false;

  public constructor(
    @Inject('searchService') private readonly searchService: SearchService<T>,
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    this.pageSubscription = route.queryParams.subscribe(
      (queryParams: Params) => {
        const name = queryParams['name'];
        if (name) {
          this.name.setValue(name);
        }

        const mode = queryParams['mode'];
        if (mode) {
          this.mode.setValue(mode);
        }
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.name.value) {
      this.entityList.setFilter('name', this.name.value);
    }
  }

  updateRoute() {
    this.router.navigate([], this.getRouteParameters());
  }

  getRouteParameters(): NavigationExtras {
    let queryParams: Params = {};

    if (this.name.value) {
      queryParams = {
        ...queryParams,
        ...{
          name: this.name.value,
        },
      };
    }

    if (this.mode.value) {
      queryParams = {
        ...queryParams,
        ...{
          mode: this.mode.value,
        },
      };
    }

    return {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: this.queryParamsMode,
      skipLocationChange: false,
    };
  }

  setFilter($event: Map<string, string>) {
    this.name.setValue($event.get('name'));
    this.refresh();
  }

  setFilterAction($event: Event) {
    const element = $event.target as HTMLInputElement;
    if (element.value) {
      this.entityList.setFilter(element.id, element.value);
    } else {
      this.entityList.removeFilter(element.id);
    }
    this.refresh();
  }

  setFilterMode($event: MatSelectChange) {
    if ($event.value) {
      this.mode.setValue($event.value as SearchStringMode);
    }
    this.updateRoute();
    this.refresh();
  }

  private refresh() {
    this.entityList.refreshData({
      queryName: this.name.value ? 'findByName' + this.mode.value : null,
      queryArguments: {},
      filterParams: this.name.value
        ? {
            name: this.name.value,
          }
        : {},
    });
  }

  setLoading($event: boolean) {
    this.loading = $event.valueOf();
  }

  updateSearchMode($event: SearchStringMode) {
    this.mode.setValue($event);
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
