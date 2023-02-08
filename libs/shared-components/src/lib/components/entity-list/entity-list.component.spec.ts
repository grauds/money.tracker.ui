import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityListComponent } from './entity-list.component';
import { Resource } from "@lagoshny/ngx-hateoas-client";

describe('EntityListComponent', () => {
  let component: EntityListComponent<Resource>;
  let fixture: ComponentFixture<EntityListComponent<Resource>>;

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
