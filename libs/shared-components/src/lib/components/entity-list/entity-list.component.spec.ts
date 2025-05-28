import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { NgZone } from '@angular/core';
import { PagedResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Entity } from '@clematis-shared/model';
import { EntityListComponent } from './entity-list.component';
import { SearchPostProcessingHandler } from '../../service/search.service';
import { SharedComponentsModule } from '../../shared-components.module';


class SearchService {

  private readonly statusDescription$ = new BehaviorSubject<string>('search');
  private searchPostProcessingHandler: SearchPostProcessingHandler<Entity> | null = null;

  getPostProcessingStream() {
    return this.searchPostProcessingHandler;
  }

  setPostProcessingStream(handler: SearchPostProcessingHandler<Entity>) {
    this.searchPostProcessingHandler = handler
  }

  getStatusDescription() {
    return 'test';
  }

  setProcessingStatusDescription(message: string): void {
    this.statusDescription$.next(message);
  }
}

describe('EntityListComponent', () => {
  let component: EntityListComponent<Entity>;
  let fixture: ComponentFixture<EntityListComponent<Entity>>;
  let zone: NgZone | null;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({}),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityListComponent],
      imports: [
        MatProgressBarModule,
        SharedComponentsModule
      ],
      providers: [
        {
          provide: 'searchService',
          useValue: new SearchService(),
        },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();
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
    jest.spyOn(component, 'getPageParams');
    component.setCurrentPage({
      pageIndex: 0,
      pageSize: 10,
      length: 100,
    });
    expect(component.getPageParams).toHaveReturnedWith({
      page: 0,
      size: 10,
    });
  });

  it('should refresh data with starting page', () => {
    jest.spyOn(component, 'getPageParams');

    // current page is 2
    component.limit = 25;
    component.n = 2;

    // changing query and need to refresh the data
    component.refreshData(
      {
        queryName: 'dummy',
        queryArguments: {},
      },
      true
    );
    expect(component.getPageParams).toHaveReturnedWith({
      page: 0,
      size: 25,
    });
  });

  it('should refresh data with current page', () => {
    jest.spyOn(component, 'getPageParams');

    // current page is 2
    component.limit = 25;
    component.n = 2;

    // changing query and need to refresh the data
    component.refreshData(
      {
        queryName: 'dummy',
        queryArguments: {},
      },
      false
    );
    expect(component.getPageParams).toHaveReturnedWith({
      page: 2,
      size: 25,
    });
  });

  it('should update route query params', () => {
    zone?.run(() => {
      jest.spyOn(component, 'updateFromParameters');

      // current page is 2
      component.limit = 25;
      component.n = 2;
      component.updateRoute().then(() => {
        expect(component.updateFromParameters).toHaveBeenCalledWith({
          page: 3,
          size: 25,
        });
      });
    });
  });

  it('should update from parameters', () => {
    const queryParams = {
      page: '1',
      size: '20',
      sort: 'name,asc',
      filter1: 'value1',
      filter2: 'value2',
    };
    component.updateFromParameters(queryParams);

    expect(component.n).toBe(1);
    expect(component.limit).toBe(20);
    expect(component.sort).toEqual({ name: 'asc' });
    expect(component.filter.get('filter1')).toBe('value1');
    expect(component.filter.get('filter2')).toBe('value2');
  });

  it('should load data on init if loadOnInit is true', () => {
    jest.spyOn(component, 'loadData');
    component.loadOnInit = true;
    component.ngOnInit();
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should not load data on init if loadOnInit is false', () => {
    jest.spyOn(component, 'loadData');
    component.loadOnInit = false;
    component.ngOnInit();
    expect(component.loadData).not.toHaveBeenCalled();
  });

  it('should set and get filter', () => {
    component.setFilter('testId', 'testValue');
    expect(component.filter.get('testId')).toBe('testValue');
  });

  it('should remove filter', () => {
    component.setFilter('testId', 'testValue');
    component.removeFilter('testId');
    expect(component.filter.has('testId')).toBe(false);
  });

  it('should clear all filters', () => {
    component.setFilter('testId1', 'testValue1');
    component.setFilter('testId2', 'testValue2');
    component.clearFilter();
    expect(component.filter.size).toBe(0);
  });

  it('should get correct sort parameters', () => {
    component.sort = { name: 'ASC' };
    const sortParams = component.getSortParams();
    expect(sortParams).toEqual({ sort: 'name,ASC' });
  });

  it('should get correct filter parameters', () => {
    component.setFilter('testId1', 'testValue1');
    component.setFilter('testId2', 'testValue2');
    const filterParams = component.getFilterParams();
    expect(filterParams).toEqual({
      testId1: 'testValue1',
      testId2: 'testValue2',
    });
  });
/*
  it('should update route with correct parameters', async () => {
    jest.spyOn(component['router'], 'navigate').mockResolvedValue(true);
    component.n = 1;
    component.limit = 20;
    component.sort = { name: 'ASC' };
    component.setFilter('testId', 'testValue');

    await component.updateRoute();

    expect(component['router'].navigate).toHaveBeenCalledWith([], {
      relativeTo: component['router'],
      queryParams: {
        page: 1,
        size: 20,
        sort: 'name,ASC',
        testId: 'testValue',
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  });
*/
  it('should broadcast results correctly', () => {
    const page = {
      totalElements: 100,
      pageSize: 10,
      resources: [{ name: '1' }, { name: '2' }] as Entity[],
    } as PagedResourceCollection<Entity>;

    jest.spyOn(component.loading$, 'next');
    jest.spyOn(component.entities$, 'next');

    component.broadcastResults(page);

    expect(component.total).toBe(100);
    expect(component.limit).toBe(10);
    expect(component.loading$.next).toHaveBeenCalledWith(false);
    expect(component.entities$.next).toHaveBeenCalledWith(page.resources);
  });

  it('should execute post processing if handler is set', () => {
    const handler = jest
      .fn()
      .mockReturnValue(of({} as PagedResourceCollection<Entity>));
    component['searchService'].setPostProcessingStream(handler);

    const searchResult = {} as PagedResourceCollection<Entity>;
    component.executePostProcessing(searchResult).subscribe((result) => {
      expect(result).toBe(searchResult);
    });

    expect(handler).toHaveBeenCalledWith(searchResult);
  });

  it('should not execute post processing if handler is not set', () => {
    component['searchService'].setPostProcessingStream(null);

    const searchResult = {} as PagedResourceCollection<Entity>;
    component.executePostProcessing(searchResult).subscribe((result) => {
      expect(result).toBe(searchResult);
    });
  });
});
