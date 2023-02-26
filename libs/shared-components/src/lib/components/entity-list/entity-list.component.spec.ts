import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityListComponent } from './entity-list.component';
import { Entity } from "@clematis-shared/model";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { of } from "rxjs";

describe('EntityListComponent', () => {
  let component: EntityListComponent<Entity>;
  let fixture: ComponentFixture<EntityListComponent<Entity>>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ })
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityListComponent ],
      providers: [
        { provide: "searchService", useValue: {} },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute }
      ]
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
