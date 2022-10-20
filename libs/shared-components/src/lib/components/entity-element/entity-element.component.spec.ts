import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityElementComponent } from './entity-element.component';

describe('EntityElementComponent', () => {
  let component: EntityElementComponent;
  let fixture: ComponentFixture<EntityElementComponent>;

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
