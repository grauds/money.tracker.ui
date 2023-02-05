import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityElementComponent } from './entity-element.component';
import { Resource } from "@lagoshny/ngx-hateoas-client";

describe('EntityElementComponent', () => {
  let component: EntityElementComponent<Resource>;
  let fixture: ComponentFixture<EntityElementComponent<Resource>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
