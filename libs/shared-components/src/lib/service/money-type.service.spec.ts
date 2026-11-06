import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { of } from 'rxjs';

import { MoneyTypeService } from './money-type.service';
import { EnvironmentService } from './environment.service';
import { MoneyType } from '@clematis-shared/model';

describe('MoneyTypeService', () => {
  let service: MoneyTypeService;
  let mockHateoasService: jest.Mocked<HateoasResourceService>;

  const mockMoneyTypes: MoneyType[] = [
    Object.assign(new MoneyType(), { code: 'RUB', name: 'Russian Ruble' }),
    Object.assign(new MoneyType(), { code: 'USD', name: 'US Dollar' }),
    Object.assign(new MoneyType(), { code: 'EUR', name: 'Euro' }),
  ];

  beforeEach(() => {
    mockHateoasService = {
      getPage: jest.fn().mockReturnValue(of({ resources: mockMoneyTypes })),
    } as any;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MoneyTypeService,
        { provide: EnvironmentService, useValue: { production: false } },
        { provide: HateoasResourceService, useValue: mockHateoasService },
      ],
    });

    service = TestBed.inject(MoneyTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(mockHateoasService.getPage).toHaveBeenCalled();
  });

  describe('#preloadMoneyTypes', () => {
    it('should populate moneyTypes$ with fetched data', (done) => {
      service.moneyTypes$.subscribe((types) => {
        expect(types).toHaveLength(3);
        expect(types[0].code).toBe('RUB');
        expect(types[1].code).toBe('USD');
        expect(types[2].code).toBe('EUR');
        done();
      });
    });

    it('should set default currency when nothing is selected', (done) => {
      service.selectedMoneyType$.subscribe((selected) => {
        expect(selected).toBeDefined();
        expect(selected?.code).toBe('RUB');
        done();
      });
    });
  });

  describe('#selectMoneyType', () => {
    it('should update selectedMoneyType$', (done) => {
      const usd = mockMoneyTypes.find((t) => t.code === 'USD')!;

      service.selectedMoneyType$.subscribe((selected) => {
        expect(selected?.code).toBe('USD');
        done();
      });

      service.selectMoneyType(usd);
    });
  });

  describe('#selectMoneyTypeByCode', () => {
    it('should select by code when found', (done) => {
      service.selectedMoneyType$.subscribe((selected) => {
        expect(selected?.code).toBe('EUR');
        done();
      });

      service.selectMoneyTypeByCode('EUR');
    });

    it('should warn and not change selection when code not found', (done) => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const originalCode = service.getSelectedMoneyType().code;

      service.selectMoneyTypeByCode('NONEXISTENT');

      // Selection should remain unchanged
      expect(service.getSelectedMoneyType().code).toBe(originalCode);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
      done();
    });
  });

  describe('#getSelectedMoneyType', () => {
    it('should return selected money type when one is selected', (done) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const usd = mockMoneyTypes.find((t) => t.code === 'USD')!;
      service.selectMoneyType(usd);

      const selected = service.getSelectedMoneyType();
      expect(selected.code).toBe('USD');
      done();
    });

    it('should fallback to default currency when nothing selected', () => {
      // Create a new service instance with empty preload
      mockHateoasService.getPage = jest.fn().mockReturnValue(of({ resources: [] }));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          MoneyTypeService,
          { provide: EnvironmentService, useValue: { production: false } },
          { provide: HateoasResourceService, useValue: mockHateoasService },
        ],
      });

      const freshService = TestBed.inject(MoneyTypeService);
      const selected = freshService.getSelectedMoneyType();
      expect(selected.code).toBe('RUB');
    });

    it('should create new MoneyType with code when nothing available', () => {
      // When moneyTypes$ is empty and nothing selected
      const freshMock = {
        getPage: jest.fn().mockReturnValue(of({ resources: [] })),
      } as any;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          MoneyTypeService,
          { provide: EnvironmentService, useValue: { production: false } },
          { provide: HateoasResourceService, useValue: freshMock },
        ],
      });

      const freshService = TestBed.inject(MoneyTypeService);
      const selected = freshService.getSelectedMoneyType();
      expect(selected).toBeDefined();
      expect(selected.code).toBe('RUB');
    });
  });

  describe('#getLoadedMoneyTypes', () => {
    it('should return loaded money types', (done) => {
      service.moneyTypes$.subscribe(() => {
        const loaded = service.getLoadedMoneyTypes();
        expect(loaded).toHaveLength(3);
        done();
      });
    });
  });

  describe('#getCurrencyByCode', () => {
    it('should return currency when code exists', (done) => {
      service.getCurrencyByCode('USD').subscribe((currency) => {
        expect(currency.code).toBe('USD');
        done();
      });
    });

    it('should fallback to default currency when code not found', (done) => {
      service.getCurrencyByCode('NONEXISTENT').subscribe((currency) => {
        expect(currency.code).toBe('RUB');
        done();
      });
    });
  });

  describe('#getCachedCurrencyByCode', () => {
    it('should return currency when code exists in cache', (done) => {
      service.moneyTypes$.subscribe(() => {
        const cached = service.getCachedCurrencyByCode('USD');
        expect(cached?.code).toBe('USD');
        done();
      });
    });

    it('should return undefined when code not in cache', (done) => {
      service.moneyTypes$.subscribe(() => {
        const cached = service.getCachedCurrencyByCode('NONEXISTENT');
        expect(cached).toBeUndefined();
        done();
      });
    });
  });
});
