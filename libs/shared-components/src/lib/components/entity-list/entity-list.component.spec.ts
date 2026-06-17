import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { NgZone } from '@angular/core';
import { PagedResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Entity } from '@clematis-shared/model';
import { EntityListComponent } from './entity-list.component';
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import { CookieService } from "../../service/cookie.service";


try {
  TestBed.initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting()
  );
} catch {
  // Environment already initialized safely by another parallel Jest worker
}

if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
}

class MockSearchService {
  private readonly statusDescription$ = new BehaviorSubject<string>('search');
  private handler: any = null;

  setProcessingStatusDescription(message: string): void {
    this.statusDescription$.next(message);
  }
  getStatusDescription() {
    return this.statusDescription$.asObservable();
  }
  getPostProcessingStream() {
    return this.handler;
  }
  setPostProcessingStream(handler: any) {
    this.handler = handler;
  }
  getPage() {
    return of({ totalElements: 0, pageSize: 10, resources: [] });
  }
}

describe('EntityListComponent', () => {
  let component: EntityListComponent<Entity>;
  let fixture: ComponentFixture<EntityListComponent<Entity>>;
  let zone: NgZone | null;
  let mockRouter: any;
  let mockCookieService: jest.Mocked<Partial<CookieService>>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({}),
      queryParamMap: { keys: [] }
    },
  } as unknown as ActivatedRoute;

  beforeEach(async () => {

    mockCookieService = {
      setState: jest.fn(),
      getState: jest.fn().mockReturnValue(null)
    };

    mockRouter = {
      url: '/mock-route',
      navigate: jest.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      declarations: [EntityListComponent],
      imports: [], // Remove heavy UI modules here to isolate logic bugs
      providers: [
        { provide: CookieService, useValue: mockCookieService },
        { provide: 'searchService', useClass: MockSearchService },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ],
      // NO_ERRORS_SCHEMA tells Jest to ignore custom HTML elements templates tags
      // preventing the ɵɵdomElementStart missing error
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityListComponent);
    component = fixture.componentInstance;
    zone = fixture.ngZone;

    // Assign mock search service before ngOnInit runs
    component.searchService = TestBed.inject('searchService' as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should properly set page parameters', () => {
    component.setCurrentPage({
      pageIndex: 0,
      pageSize: 10,
      length: 100,
    } as any);

    expect(component.n).toBe(0);
    expect(component.limit).toBe(10);
  });

  it('should refresh data with starting page', () => {
    component.limit = 25;
    component.n = 2;

    component.refreshData(
      {
        queryName: 'dummy',
        queryArguments: {},
      },
      true
    );
    expect(component.n).toBe(0);
    expect(component.limit).toBe(25);
  });

  it('should refresh data with current page', () => {
    component.limit = 25;
    component.n = 2;

    component.refreshData(
      {
        queryName: 'dummy',
        queryArguments: {},
      },
      false
    );
    expect(component.n).toBe(2);
    expect(component.limit).toBe(25);
  });

  it('should update route query params', async () => {
    component.updateRouterState = true;
    component.limit = 25;
    component.n = 2;

    await zone?.run(() => component.conditionalRouteUpdate());
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should update from parameters via UrlStateAdapter integration', () => {
    const queryParams = {
      page: '1',
      size: '20',
      sort: 'name,asc',
      filter1: 'value1',
      filter2: 'value2',
    };

    // Trigger internal private tracking or the public call directly
    component['updateFromParameters'](queryParams);

    expect(component.n).toBe(1);
    expect(component.limit).toBe(20);
    expect(component.sort).toEqual({ name: 'asc' });
    expect(component.filter.get('filter1')).toBe('value1');
    expect(component.filter.get('filter2')).toBe('value2');
  });

  it('should load data on init if loadOnInit is true', () => {
    const spy = jest.spyOn(component, 'loadData');
    component.loadOnInit = true;
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
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

  it('should broadcast results correctly', () => {
    const page = {
      totalElements: 100,
      pageSize: 10,
      resources: [{ name: '1' }, { name: '2' }] as any[],
    } as PagedResourceCollection<Entity>;

    jest.spyOn(component.loading$, 'next');
    jest.spyOn(component.entitiesChange$, 'next');

    component.broadcastResults(page);

    expect(component.total).toBe(100);
    expect(component.limit).toBe(10);
    expect(component.loading$.next).toHaveBeenCalledWith(false);
    expect(component.entitiesChange$.next).toHaveBeenCalledWith(page.resources);
  });
});
