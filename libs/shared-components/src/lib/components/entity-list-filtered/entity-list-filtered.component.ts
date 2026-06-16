import {
  AfterViewInit,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  Injector,
  OnDestroy,
} from '@angular/core';
import {
  ActivatedRoute,
  Params,
  Router,
} from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Entity, SearchStringMode } from '@clematis-shared/model';
import { EntityListComponent, ViewRepresentation } from "../entity-list/entity-list.component";
import { SearchService } from '../../service/search.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-search',
  templateUrl: './entity-list-filtered.component.html',
  styleUrls: ['./entity-list-filtered.component.sass'],
  standalone: false
})
export class EntityListFilteredComponent<T extends Entity>
  implements AfterViewInit, OnDestroy
{
  @Input() searchServiceOverride?: SearchService<T>;

  @ViewChild(EntityListComponent) entityList!: EntityListComponent<T>;

  @Input() filterTemplate: TemplateRef<any> | undefined;
  @Input() listTemplate?: TemplateRef<any>;
  @Input() tableTemplate?: TemplateRef<any>;
  @Input() thumbnailTemplate?: TemplateRef<any>;

  @Input() currentView: ViewRepresentation = 'list';
  @Input() queryParamsMode: 'merge' | 'preserve' | '' | null = 'merge';

  @Input() updateRouterState = true;
  @Input() cookieStateKey?: string;

  pageSubscription?: Subscription;

  name: FormControl = new FormControl({ value: '', disabled: false });
  mode: FormControl<SearchStringMode | null> =
    new FormControl<SearchStringMode>(
      { value: SearchStringMode.Containing, disabled: false }
    );

  modes: SearchStringMode[] = [
    SearchStringMode.Starting,
    SearchStringMode.Containing,
    SearchStringMode.Ending,
  ];

  loading = false;

  public constructor(
    private readonly injector: Injector,
    protected router: Router,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.updateRouterState) {
      this.pageSubscription = this.route.queryParams.subscribe((queryParams: Params) => {
        this.updateFromParams(queryParams);
      });
    }
  }

  ngAfterViewInit(): void {
    if (!this.updateRouterState && this.cookieStateKey) {
      const nameVal = this.entityList.filter.get('name') ?? '';
      const modeVal = this.entityList.filter.get('mode') as SearchStringMode
        ?? SearchStringMode.Containing;

      this.name.setValue(nameVal);
      this.mode.setValue(modeVal);
      this.refresh();
    }
  }

  private updateFromParams(queryParams: Params): void {
    this.name.setValue(queryParams['name'] ?? '');
    const enumValue = this.modes.find(m => m === queryParams['mode']);
    this.mode.setValue(enumValue ?? SearchStringMode.Containing);

    if (this.entityList) {
      this.syncFiltersToComponent();
      this.refresh();
    }
  }

  private syncFiltersToComponent(): void {
    if (!this.entityList) {
      return;
    }

    if (this.name.value) {
      this.entityList.setFilter('name', this.name.value);
    } else {
      this.entityList.removeFilter('name');
    }

    if (this.mode.value) {
      this.entityList.setFilter('mode', this.mode.value.toString());
    } else {
      this.entityList.removeFilter('mode');
    }
  }

  private getRouteIsolatedCookieKey(): string | null {
    if (!this.cookieStateKey) {
      return null;
    }
    const basePath = this.router.url.split('?')[0];
    const sanitizedPath = basePath.replace(/\//g, '_');
    return `${this.cookieStateKey}_filter_${sanitizedPath}`;
  }

  setFilterListener($event: Map<string, string>) {
    this.name.setValue($event.get('name'));
    const modeValue = $event.get('mode');
    const enumValue = this.modes.find(m => m === modeValue);
    this.mode.setValue(enumValue ?? SearchStringMode.Containing);
    this.refresh()
  }

  setFilterName($event: Event) {
    const element = $event.target as HTMLInputElement;
    if (element.value) {
      this.entityList.setFilter(element.id, element.value);
    } else {
      this.entityList.removeFilter(element.id);
    }
  }

  setFilterMode($event: MatSelectChange) {
    if ($event.value) {
      this.mode.setValue($event.value as SearchStringMode);
    }
    if (this.mode.value) {
      this.entityList.setFilter('mode', this.mode.value.toString());
    } else {
      this.entityList.removeFilter('mode');
    }
  }

  updateSearchMode($event: SearchStringMode) {
    this.mode.setValue($event);
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
    }, false);
  }

  setLoading($event: boolean) {
    this.loading = $event.valueOf();
    if (this.loading) {
      this.name.disable();
      this.mode.disable();
    } else {
      this.name.enable();
      this.mode.enable();
    }
  }

  ngOnDestroy(): void {
    if (this.pageSubscription) {
      this.pageSubscription.unsubscribe();
    }
  }

}
