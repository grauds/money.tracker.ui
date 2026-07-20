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

  @Input() key = 'name';

  name = new FormControl<string>(
    { value: '', disabled: false }, { nonNullable: true }
  );

  private filterSubscription?: Subscription;
  private loadingSubscription?: Subscription;

  ngOnInit(): void {
    this.name.setValue(this.entityList.gridState.filter.get(this.key) ?? '');

    this.filterSubscription = this.entityList.filter$.subscribe((filter) => {
      this.name.setValue(filter.get(this.key) ?? '', { emitEvent: false });
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
      this.entityList.setFilter(this.key, value);
    } else {
      this.entityList.removeFilter(this.key);
    }
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
    this.loadingSubscription?.unsubscribe();
  }
}
