import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EntityNameFilterComponent } from './entity-name-filter.component';
import { EntityListComponent } from '../entity-list.component';
import { BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EntityNameFilterComponent', () => {
  let component: EntityNameFilterComponent<any>;
  let fixture: ComponentFixture<EntityNameFilterComponent<any>>;
  let mockEntityList: any;

  beforeEach(async () => {
    const filterMap = new Map<string, string>();
    const getMock = jest.fn<string | undefined, [key: string]>((key: string) => filterMap.get(key));
    mockEntityList = {
      gridState: {
        filter: filterMap,
      },
      filter$: new BehaviorSubject({
        get: getMock,
      }),
      loading$: new BehaviorSubject<boolean>(false),
      setFilter: jest.fn(),
      removeFilter: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [EntityNameFilterComponent],
      providers: [{ provide: EntityListComponent, useValue: mockEntityList }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityNameFilterComponent);
    component = fixture.componentInstance;
    component.entityList = mockEntityList;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty control value', () => {
    expect(component.name.value).toBe('');
  });

  describe('ngOnInit', () => {
    it('should set FormControl value from gridState filter', () => {
      mockEntityList.gridState.filter.set('name', 'test filter');
      fixture = TestBed.createComponent(EntityNameFilterComponent);
      component = fixture.componentInstance;
      component.entityList = mockEntityList;
      fixture.detectChanges();

      expect(component.name.value).toBe('test filter');
    });

    it('should sync from filter$ observable', fakeAsync(() => {
      const newFilter$ = new BehaviorSubject({
        get: jest.fn(() => 'updated'),
      } as never);
      mockEntityList.filter$ = newFilter$;

      component.ngOnInit();

      newFilter$.next({ get: jest.fn(() => 'new value') } as never);
      tick();

      expect(component['filterSubscription']).toBeDefined();
    }));

    it('should disable control when loading is true', fakeAsync(() => {
      const loading$ = new BehaviorSubject<boolean>(false);
      mockEntityList.loading$ = loading$;

      component.ngOnInit();

      expect(component.name.enabled).toBe(true);

      loading$.next(true);
      tick();
      expect(component.name.disabled).toBe(true);
    }));

    it('should enable control when loading is false', fakeAsync(() => {
      const loading$ = new BehaviorSubject<boolean>(true);
      mockEntityList.loading$ = loading$;

      component.ngOnInit();

      loading$.next(false);
      tick();
      expect(component.name.enabled).toBe(true);
    }));
  });

  describe('#setFilterName', () => {
    it('should call setFilter when value is non-empty', () => {
      const event = { target: { value: '  search term  ' } } as unknown as Event;

      component.setFilterName(event);

      expect(mockEntityList.setFilter).toHaveBeenCalledWith(
        'name',
        'search term'
      );
    });

    it('should call setFilter with trimmed value', () => {
      const event = { target: { value: '  trimmed  ' } } as unknown as Event;

      component.key = 'customKey';
      component.setFilterName(event);

      expect(mockEntityList.setFilter).toHaveBeenCalledWith(
        'customKey',
        'trimmed'
      );
    });

    it('should call removeFilter when value is empty after trim', () => {
      const event = { target: { value: '   ' } } as unknown as Event;

      component.setFilterName(event);

      expect(mockEntityList.removeFilter).toHaveBeenCalledWith('name');
    });

    it('should call removeFilter when value is empty string', () => {
      const event = { target: { value: '' } } as unknown as Event;

      component.setFilterName(event);

      expect(mockEntityList.removeFilter).toHaveBeenCalledWith('name');
    });
  });

  describe('#ngOnDestroy', () => {
    it('should unsubscribe from filterSubscription', fakeAsync(() => {
      const filter$ = new BehaviorSubject({ get: jest.fn() });
      mockEntityList.filter$ = filter$;
      component.ngOnInit();

      const unsubscribeSpy = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (component as any).filterSubscription!,
        'unsubscribe'
      );
      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    }));

    it('should unsubscribe from loadingSubscription', fakeAsync(() => {
      mockEntityList.loading$ = new BehaviorSubject<boolean>(false);
      component.ngOnInit();

      const unsubscribeSpy = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (component as any).loadingSubscription!,
        'unsubscribe'
      );
      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    }));
  });
});
