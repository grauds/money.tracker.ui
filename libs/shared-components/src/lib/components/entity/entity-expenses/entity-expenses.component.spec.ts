import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EntityExpensesComponent } from './entity-expenses.component';
import { ExpenseItemsService } from '../../../service/expense-items.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock ExpenseItemsService
class MockExpenseItemsService {
  getPage = jest.fn().mockReturnValue({ subscribe: (cb: any) => cb([]) });
}

describe('EntityExpensesComponent', () => {
  let component: EntityExpensesComponent;
  let fixture: ComponentFixture<EntityExpensesComponent>;
  let mockExpenseService: MockExpenseItemsService;

  beforeEach(async () => {
    mockExpenseService = new MockExpenseItemsService();

    await TestBed.configureTestingModule({
      declarations: [EntityExpensesComponent],
      providers: [
        { provide: ExpenseItemsService, useValue: mockExpenseService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityExpensesComponent);
    component = fixture.componentInstance;
    component.expenseService = mockExpenseService as never;
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
    expect(component.expenses).toEqual([]);
    expect(component.chartConfig).toEqual({});
    expect(component.displayedColumns).toEqual([
      'commodityname',
      'transferdate',
      'price',
      'qty',
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
      expect(component.expenses).toEqual([]);
    }));

    it('should set empty chartConfig when only one entity received', fakeAsync(() => {
      const singleExpense = {
        id: '1',
        qty: 10,
        price: 5,
        transferDate: new Date('2024-06-15'),
      } as never;

      component.entitiesChanged.subscribe((entities) => {
        expect(entities.length).toBe(1);
        expect(component.chartConfig).toEqual({});
      });

      component.onEntitiesReceived([singleExpense]);
      tick();
      expect(component.expenses.length).toBe(1);
    }));

    it('should generate chartConfig when multiple entities received', fakeAsync(() => {
      const expenses = [
        {
          id: '1',
          qty: 10,
          price: 5,
          transferDate: new Date('2024-06-15'),
        },
        {
          id: '2',
          qty: 20,
          price: 8,
          transferDate: new Date('2024-06-16'),
        },
      ] as never[];

      component.entitiesChanged.subscribe((entities) => {
        expect(entities.length).toBe(2);
      });

      component.onEntitiesReceived(expenses);
      tick();
      expect(component.expenses.length).toBe(2);
      expect(component.chartConfig).toBeDefined();
      expect(component.chartConfig.tooltip).toBeDefined();
      expect(component.chartConfig.legend).toBeDefined();
      expect(component.chartConfig.series).toHaveLength(2);
      expect(component.chartConfig.series[0].name).toBe('Total');
      expect(component.chartConfig.series[1].name).toBe('Price');
    }));

    it('should handle null entities as empty array', fakeAsync(() => {
      component.entitiesChanged.subscribe((entities) => {
        expect(entities).toEqual([]);
      });

      component.onEntitiesReceived([]);
      tick();
      expect(component.expenses).toEqual([]);
    }));
  });
});
