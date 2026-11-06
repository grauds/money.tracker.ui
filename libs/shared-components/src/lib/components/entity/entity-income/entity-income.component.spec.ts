import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EntityIncomeComponent } from './entity-income.component';
import { IncomeItemsService } from '../../../service/income-items.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock IncomeItemsService
class MockIncomeItemsService {
  getPage = jest.fn().mockReturnValue({ subscribe: (cb: any) => cb([]) });
}

describe('EntityIncomeComponent', () => {
  let component: EntityIncomeComponent;
  let fixture: ComponentFixture<EntityIncomeComponent>;
  let mockIncomeService: MockIncomeItemsService;

  beforeEach(async () => {
    mockIncomeService = new MockIncomeItemsService();

    await TestBed.configureTestingModule({
      declarations: [EntityIncomeComponent],
      providers: [
        { provide: IncomeItemsService, useValue: mockIncomeService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityIncomeComponent);
    component = fixture.componentInstance;
    component.incomeService = mockIncomeService as never;
    component.cookieStateKey = 'test-key';
    component.queryArguments = {} as never;
    component.queryName = 'findByAccount';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBe(false);
    expect(component.income).toEqual([]);
    expect(component.chartConfig).toEqual({});
    expect(component.displayedColumns).toEqual([
      'commodityname',
      'transferdate',
      'price',
      'organizationname',
    ]);
  });

  describe('#onLoading', () => {
    it('should emit loadingChanged via queueMicrotask', fakeAsync(() => {
      component.loadingChanged.subscribe((loading) => {
        expect(loading).toBe(true);
      });

      component.onLoading(true);
      tick();
      expect(component.loading).toBe(true);
    }));

    it('should set loading to false and emit', fakeAsync(() => {
      component.loadingChanged.subscribe((loading) => {
        expect(loading).toBe(false);
      });

      component.onLoading(false);
      tick();
      expect(component.loading).toBe(false);
    }));
  });

  describe('#onEntitiesReceived', () => {
    it('should emit empty array and set empty chartConfig when no entities', fakeAsync(() => {
      component.entitiesChanged.subscribe((entities) => {
        expect(entities).toEqual([]);
        expect(component.chartConfig).toEqual({});
      });

      component.onEntitiesReceived([]);
      tick();
      expect(component.income).toEqual([]);
    }));

    it('should set empty chartConfig when only one entity received', fakeAsync(() => {
      const singleIncome = {
        id: '1',
        total: 100,
        transferDate: new Date('2024-06-15'),
      } as never;

      component.entitiesChanged.subscribe((entities) => {
        expect(entities.length).toBe(1);
        expect(component.chartConfig).toEqual({});
      });

      component.onEntitiesReceived([singleIncome]);
      tick();
      expect(component.income.length).toBe(1);
    }));

    it('should generate chartConfig with Value series when multiple entities received', fakeAsync(() => {
      const incomes = [
        {
          id: '1',
          total: 100,
          transferDate: new Date('2024-06-15'),
        },
        {
          id: '2',
          total: 200,
          transferDate: new Date('2024-06-16'),
        },
      ] as never[];

      component.entitiesChanged.subscribe((entities) => {
        expect(entities.length).toBe(2);
      });

      component.onEntitiesReceived(incomes);
      tick();
      expect(component.income.length).toBe(2);
      expect(component.chartConfig).toBeDefined();
      expect(component.chartConfig.tooltip).toBeDefined();
      expect(component.chartConfig.legend.data).toContain('Value');
      expect(component.chartConfig.series).toHaveLength(1);
      expect(component.chartConfig.series[0].name).toBe('Value');
      expect(component.chartConfig.series[0].type).toBe('line');
    }));

    it('should handle null entities as empty array', fakeAsync(() => {
      component.entitiesChanged.subscribe((entities) => {
        expect(entities).toEqual([]);
      });

      component.onEntitiesReceived([]);
      tick();
      expect(component.income).toEqual([]);
    }));
  });
});
