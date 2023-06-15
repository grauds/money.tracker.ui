import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityListComponent } from './entity-list.component';
import { Entity } from "@clematis-shared/model";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { of } from "rxjs";
import { NgZone } from "@angular/core";

describe('EntityListComponent', () => {

  let component: EntityListComponent<Entity>;
  let fixture: ComponentFixture<EntityListComponent<Entity>>;
  let zone: NgZone | null

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
    fixture = TestBed.createComponent(EntityListComponent);
    component = fixture.componentInstance;
    zone = fixture.ngZone;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should properly set page parameters', () => {
    jest.spyOn(component, 'getPageParams')
    component.setCurrentPage({
      pageIndex: 0,
      pageSize: 10,
      length: 100
    })
    expect(component.getPageParams).toReturnWith({
      page: 0,
      size: 10
    })
  })

  it('should refresh data with starting page', () => {
    jest.spyOn(component, 'getPageParams')

    // current page is 2
    component.limit = 25
    component.n = 2

    // changing query and need to refresh the data
    component.refreshData({
      queryName: 'dummy',
      queryArguments: {}
    }, true)
    expect(component.getPageParams).toReturnWith({
      page: 0,
      size: 25
    })
  })

  it('should refresh data with current page', () => {
    jest.spyOn(component, 'getPageParams')

    // current page is 2
    component.limit = 25
    component.n = 2

    // changing query and need to refresh the data
    component.refreshData({
      queryName: 'dummy',
      queryArguments: {}
    }, false)
    expect(component.getPageParams).toReturnWith({
      page: 2,
      size: 25
    })
  })

  it('should update route query params', () => {
    zone?.run(() => {

      jest.spyOn(component, 'updateFromParameters')

      // current page is 2
      component.limit = 25
      component.n = 2
      component.updateRoute().then(() => {

        expect(component.updateFromParameters).toBeCalledWith({
          page: 3,
          size: 25
        })
      })

    })
  })
});
