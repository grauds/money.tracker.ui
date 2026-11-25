import { DateRangeSelectorComponent } from './date-range-selector.component';
import { Moment, default as moment } from 'moment';

const STORAGE_KEY = 'date_range_selector_state';

describe('DateRangeSelectorComponent', () => {
  let component: DateRangeSelectorComponent;

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    component = new DateRangeSelectorComponent();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default date range', () => {
    const expectedStartMonth = moment().subtract(24, 'M').month();
    const expectedStartYear = moment().subtract(24, 'M').year();
    const expectedEndMonth = moment().add(1, 'M').month();
    const expectedEndYear = moment().add(1, 'M').year();

    expect(component.startDate.value?.month()).toBe(expectedStartMonth);
    expect(component.startDate.value?.year()).toBe(expectedStartYear);
    expect(component.endDate.value?.month()).toBe(expectedEndMonth);
    expect(component.endDate.value?.year()).toBe(expectedEndYear);
  });

  it('should initialize minDate to 30 years ago', () => {
    const currentYear = new Date().getFullYear();
    expect(component.minDate.getFullYear()).toBe(currentYear - 30);
  });

  it('should initialize maxDate to 1 year ahead', () => {
    const currentYear = new Date().getFullYear();
    expect(component.maxDate.getFullYear()).toBe(currentYear + 1);
  });

  describe('state restoration', () => {
    it('should restore valid dates from localStorage on init and emit them asynchronously', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ start: '2022-03', end: '2023-09' }),
      );

      // Must be instantiated AFTER localStorage.setItem so the constructor reads it
      const restoredComponent = new DateRangeSelectorComponent();

      let emittedStart: Moment | undefined;
      let emittedEnd: Moment | undefined;
      restoredComponent.startDate$.subscribe((val) => (emittedStart = val));
      restoredComponent.endDate$.subscribe((val) => (emittedEnd = val));

      restoredComponent.ngOnInit();
      await Promise.resolve(); // Flush queueMicrotask

      expect(restoredComponent.startDate.value?.format('YYYY-MM')).toBe(
        '2022-03',
      );
      expect(restoredComponent.endDate.value?.format('YYYY-MM')).toBe(
        '2023-09',
      );
      expect(emittedStart?.format('YYYY-MM')).toBe('2022-03');
      expect(emittedEnd?.format('YYYY-MM')).toBe('2023-09');
    });

    it('should keep default dates and not emit when localStorage is empty', async () => {
      const startSpy = jest.spyOn(component.startDate$, 'emit');
      const endSpy = jest.spyOn(component.endDate$, 'emit');

      component.ngOnInit();
      await Promise.resolve();

      expect(startSpy).not.toHaveBeenCalled();
      expect(endSpy).not.toHaveBeenCalled();
    });

    it('should ignore corrupted JSON in localStorage without throwing', () => {
      localStorage.setItem(STORAGE_KEY, '{invalid-json');

      expect(() => new DateRangeSelectorComponent().ngOnInit()).not.toThrow();
    });

    it('should ignore invalid date strings in localStorage', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ start: 'not-a-date', end: '2023-15' }),
      );
      const invalidStorageComponent = new DateRangeSelectorComponent();
      const startSpy = jest.spyOn(invalidStorageComponent.startDate$, 'emit');

      invalidStorageComponent.ngOnInit();
      await Promise.resolve();

      expect(startSpy).not.toHaveBeenCalled();
    });
  });

  describe('#setStartMonthAndYear', () => {
    it('should update startDate, emit startDate$, and save to localStorage', () => {
      component.endDate.setValue(moment('2025-12-01'));
      const testMonth = moment('2024-06-01');
      let emittedValue: Moment | undefined;

      component.startDate$.subscribe((emitted) => {
        emittedValue = emitted;
      });

      const datepicker = { close: jest.fn() } as any;

      component.setStartMonthAndYear(testMonth, datepicker);

      expect(datepicker.close).toHaveBeenCalled();
      expect(component.startDate.value?.month()).toBe(5);
      expect(component.startDate.value?.year()).toBe(2024);
      expect(emittedValue?.month()).toBe(5);
      expect(emittedValue?.year()).toBe(2024);

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(saved).toEqual({ start: '2024-06', end: '2025-12' });
    });
  });

  describe('#setEndMonthAndYear', () => {
    it('should update endDate, emit endDate$, and save to localStorage', () => {
      component.startDate.setValue(moment('2024-01-01'));
      const testMonth = moment('2025-12-01');
      let emittedValue: Moment | undefined;

      component.endDate$.subscribe((emitted) => {
        emittedValue = emitted;
      });

      const datepicker = { close: jest.fn() } as any;

      component.setEndMonthAndYear(testMonth, datepicker);

      expect(datepicker.close).toHaveBeenCalled();
      expect(component.endDate.value?.month()).toBe(11);
      expect(component.endDate.value?.year()).toBe(2025);
      expect(emittedValue?.month()).toBe(11);
      expect(emittedValue?.year()).toBe(2025);

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(saved).toEqual({ start: '2024-01', end: '2025-12' });
    });
  });

  describe('#shiftRange', () => {
    it('should shift backward by 50% of the selected month span', () => {
      // 12-month span -> 50% = 6 months
      component.startDate.setValue(moment('2024-06-01'));
      component.endDate.setValue(moment('2025-06-01'));

      let startEmitted: Moment | undefined;
      let endEmitted: Moment | undefined;
      component.startDate$.subscribe((val) => (startEmitted = val));
      component.endDate$.subscribe((val) => (endEmitted = val));

      component.shiftRange(-1);

      expect(component.startDate.value?.format('YYYY-MM')).toBe('2023-12');
      expect(component.endDate.value?.format('YYYY-MM')).toBe('2024-12');
      expect(startEmitted?.format('YYYY-MM')).toBe('2023-12');
      expect(endEmitted?.format('YYYY-MM')).toBe('2024-12');

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(saved).toEqual({ start: '2023-12', end: '2024-12' });
    });

    it('should shift forward by 50% of the selected month span', () => {
      // 10-month span -> 50% = 5 months
      component.startDate.setValue(moment('2024-01-01'));
      component.endDate.setValue(moment('2024-11-01'));

      component.shiftRange(1);

      expect(component.startDate.value?.format('YYYY-MM')).toBe('2024-06');
      expect(component.endDate.value?.format('YYYY-MM')).toBe('2025-04');
    });

    it('should shift by at least 1 month when span is 0 or 1 month', () => {
      component.startDate.setValue(moment('2024-05-01'));
      component.endDate.setValue(moment('2024-05-01'));

      component.shiftRange(1);

      expect(component.startDate.value?.format('YYYY-MM')).toBe('2024-06');
      expect(component.endDate.value?.format('YYYY-MM')).toBe('2024-06');
    });

    it('should handle null start value gracefully', () => {
      component.startDate.setValue(null);
      component.endDate.setValue(moment('2024-06-01'));

      expect(() => component.shiftRange(-1)).not.toThrow();
    });

    it('should handle null end value gracefully', () => {
      component.startDate.setValue(moment('2024-06-01'));
      component.endDate.setValue(null);

      expect(() => component.shiftRange(1)).not.toThrow();
    });

    it('should handle both null values gracefully', () => {
      component.startDate.setValue(null);
      component.endDate.setValue(null);

      expect(() => component.shiftRange(-1)).not.toThrow();
    });
  });
});
