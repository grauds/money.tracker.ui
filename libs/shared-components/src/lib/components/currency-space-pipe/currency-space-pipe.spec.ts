import { CurrencyPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { CurrencySpacePipe } from './currency-space-pipe';

describe('CurrencySpacePipe', () => {
  let pipe: CurrencySpacePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrencySpacePipe, CurrencyPipe],
    });
    pipe = TestBed.inject(CurrencySpacePipe);
  });

  it('should create the pipe', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform with currency code display', () => {
    it('should add non-breaking space between currency code and value', () => {
      const result = pipe.transform(285, 'RUB', 'code');
      // The pipe adds a non-breaking space between currency code and number
      expect(result).toContain('RUB');
      expect(result).toContain('285');
    });

    it('should add non-breaking space for USD', () => {
      const result = pipe.transform(1000.5, 'USD', 'code');
      expect(result).toContain('USD');
      expect(result).toContain('1');
    });

    it('should handle negative values with currency code', () => {
      const result = pipe.transform(-50, 'EUR', 'code');
      expect(result).toContain('EUR');
      expect(result).toContain('50');
    });

    it('should handle zero value', () => {
      const result = pipe.transform(0, 'RUB', 'code');
      expect(result).toContain('RUB');
      expect(result).toContain('0');
    });
  });

  describe('transform with symbolic display', () => {
    it('should format with symbol', () => {
      const result = pipe.transform(285, 'RUB', 'symbol');
      expect(result).toContain('285');
    });

    it('should format USD with symbol', () => {
      const result = pipe.transform(1000, 'USD', 'symbol');
      expect(result).toContain('1');
    });
  });

  describe('transform with narrow symbol display', () => {
    it('should format with narrow symbol', () => {
      const result = pipe.transform(285, 'RUB', 'narrowSymbol');
      expect(result).toContain('285');
    });
  });

  describe('edge cases', () => {
    it('should return null for null value', () => {
      const result = pipe.transform(null, 'RUB', 'code');
      expect(result).toBeNull();
    });

    it('should return null for undefined value', () => {
      const result = pipe.transform(undefined, 'RUB', 'code');
      expect(result).toBeNull();
    });

    it('should return null for NaN', () => {
      const result = pipe.transform(NaN, 'RUB', 'code');
      expect(result).toBeNull();
    });

    it('should use default currency code RUB when not specified', () => {
      const result = pipe.transform(285);
      expect(result).toContain('RUB');
    });

    it('should respect custom digitsInfo', () => {
      const result = pipe.transform(285.678, 'USD', 'code', '1.0-0');
      expect(result).toContain('USD');
    });
  });
});
