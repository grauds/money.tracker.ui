import { DateRangeSelectorComponent } from './date-range-selector.component';
import { Moment, default as moment } from 'moment';

describe('DateRangeSelectorComponent', () => {
  let component: DateRangeSelectorComponent;

  beforeEach(() => {
    component = new DateRangeSelectorComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default date range', () => {
    const expectedStartMonth = moment().add(-6, 'M').month();
    const expectedStartYear = moment().add(-6, 'M').year();
    const expectedEndMonth = moment().add(1, 'M').month();
    const expectedEndYear = moment().add(1, 'M').year();

    expect(component.startDate.value?.month()).toBe(expectedStartMonth);
    expect(component.startDate.value?.year()).toBe(expectedStartYear);
    expect(component.endDate.value?.month()).toBe(expectedEndMonth);
    expect(component.endDate.value?.year()).toBe(expectedEndYear);
  });

  it('should initialize minDate to 20 years ago', () => {
    const currentYear = new Date().getFullYear();
    expect(component.minDate.getFullYear()).toBe(currentYear - 20);
  });

  it('should initialize maxDate to 1 year ahead', () => {
    const currentYear = new Date().getFullYear();
    expect(component.maxDate.getFullYear()).toBe(currentYear + 1);
  });

  describe('#setStartMonthAndYear', () => {
    it('should update startDate FormControl and emit startDate$', () => {
      const testMonth = moment('2024-06-01');
      let emittedValue: Moment | undefined;

      component.startDate$.subscribe((emitted) => {
        emittedValue = emitted;
      });

      // Mock datepicker
      const datepicker = { close: jest.fn() } as any;

      component.setStartMonthAndYear(testMonth, datepicker);

      expect(datepicker.close).toHaveBeenCalled();
      expect(component.startDate.value?.month()).toBe(5);
      expect(component.startDate.value?.year()).toBe(2024);
      expect(emittedValue?.month()).toBe(5);
      expect(emittedValue?.year()).toBe(2024);
    });
  });

  describe('#setEndMonthAndYear', () => {
    it('should update endDate FormControl and emit endDate$', () => {
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
    });
  });

  describe('#minusSixMonths', () => {
    it('should shift both start and end dates by -6 months', () => {
      const startMonth = moment('2024-06-01');
      const endMonth = moment('2025-01-01');
      component.startDate.setValue(moment(startMonth));
      component.endDate.setValue(moment(endMonth));

      component.minusSixMonths();

      // June - 6 months = December (month 11)
      expect(component.startDate.value?.month()).toBe(11);
      expect(component.startDate.value?.year()).toBe(2023);
      // January - 6 months = July (month 6)
      expect(component.endDate.value?.month()).toBe(6);
      expect(component.endDate.value?.year()).toBe(2024);
    });

    it('should handle undefined start value gracefully', () => {
      component.startDate.setValue(null as any);
      component.endDate.setValue(moment('2024-06-01'));

      expect(() => component.minusSixMonths()).not.toThrow();
    });

    it('should handle undefined end value gracefully', () => {
      component.startDate.setValue(moment('2024-06-01'));
      component.endDate.setValue(null as any);

      expect(() => component.minusSixMonths()).not.toThrow();
    });

    it('should handle both undefined values gracefully', () => {
      component.startDate.setValue(null as any);
      component.endDate.setValue(null as any);

      expect(() => component.minusSixMonths()).not.toThrow();
    });
  });

  describe('#plusSixMonths', () => {
    it('should shift both start and end dates by +6 months', () => {
      component.startDate.setValue(moment('2024-01-01'));
      component.endDate.setValue(moment('2024-08-01'));

      let startEmitted: Moment | undefined;
      component.startDate$.subscribe((emitted) => {
        startEmitted = emitted;
      });

      component.plusSixMonths();

      // January + 6 months = July (month 6)
      expect(component.startDate.value?.month()).toBe(6);
      expect(component.startDate.value?.year()).toBe(2024);
      expect(startEmitted?.month()).toBe(6);
    });

    it('should handle undefined start value gracefully', () => {
      component.startDate.setValue(null as any);
      component.endDate.setValue(moment('2024-06-01'));

      expect(() => component.plusSixMonths()).not.toThrow();
    });

    it('should handle undefined end value gracefully', () => {
      component.startDate.setValue(moment('2024-06-01'));
      component.endDate.setValue(null as any);

      expect(() => component.plusSixMonths()).not.toThrow();
    });
  });
});
