import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityListFilteredComponent } from './entity-list-filtered.component';
import { Entity } from "@clematis-shared/model";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { of } from "rxjs";

describe('SearchComponent', () => {
  let component: EntityListFilteredComponent<Entity>;
  let fixture: ComponentFixture<EntityListFilteredComponent<Entity>>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ })
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityListFilteredComponent ],
      providers: [
        { provide: "searchService", useValue: {
            getStatusDescription() {
              return 'test'
            }
          }
        },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute }
      ]
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
