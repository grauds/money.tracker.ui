import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityListFilteredComponent } from './entity-list-filtered.component';
import { Entity } from "@clematis-shared/model";

describe('SearchComponent', () => {
  let component: EntityListFilteredComponent<Entity>;
  let fixture: ComponentFixture<EntityListFilteredComponent<Entity>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityListFilteredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityListFilteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
