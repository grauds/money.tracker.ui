import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Subscription } from 'rxjs';
import { Entity } from '@clematis-shared/model';
import { EntityListComponent } from '../entity-list.component';

@Component({
  selector: "app-entity-name-filter",
  templateUrl: "./entity-name-filter.component.html",
  styleUrls: ["./entity-name-filter.component.sass"],
  standalone: false
})
export class EntityNameFilterComponent<T extends Entity>
  implements OnInit, OnDestroy {

  @Input() entityList!: EntityListComponent<T>;

  name = new FormControl<string>(
    { value: '', disabled: false }, { nonNullable: true }
  );

  private filterSubscription?: Subscription;
  private loadingSubscription?: Subscription;

  ngOnInit(): void {
    this.name.setValue(this.entityList.gridState.filter.get('name') ?? '');

    this.filterSubscription = this.entityList.filter$.subscribe((filter) => {
      this.name.setValue(filter.get('name') ?? '', { emitEvent: false });
    });

    this.loadingSubscription = this.entityList.loading$.subscribe((loading) => {
      if (loading) {
        this.name.disable({ emitEvent: false });
      } else {
        this.name.enable({ emitEvent: false });
      }
    });
  }

  setFilterName(event: Event): void {
    const element = event.target as HTMLInputElement;
    const value = element.value.trim();

    if (value) {
      this.entityList.setFilter('name', value);
    } else {
      this.entityList.removeFilter('name');
    }
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
    this.loadingSubscription?.unsubscribe();
  }
}
