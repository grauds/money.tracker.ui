import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityElementComponent } from './entity-element.component';
import { Entity } from '@clematis-shared/model';
import { RouterModule } from "@angular/router";

describe('EntityElementComponent', () => {
  let component: EntityElementComponent<Entity>;
  let fixture: ComponentFixture<EntityElementComponent<Entity>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityElementComponent],
      imports: [
        RouterModule.forRoot([{ path: '', component: EntityElementComponent }]),
      ],
    }).compileComponents();
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
