import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityListComponent } from './entity-list.component';
import { Entity } from '../../model/entity';

describe('EntityListComponent', () => {
  let component: EntityListComponent<Entity>;
  let fixture: ComponentFixture<EntityListComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
