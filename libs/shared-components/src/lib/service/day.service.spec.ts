import { DayService } from './day.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { MoneyType } from '@clematis-shared/model';
import { of } from 'rxjs';

describe('DayService', () => {
  let service: DayService;
  let httpClientMock: jest.Mocked<HttpClient>;
  let environmentServiceMock: jest.Mocked<EnvironmentService>;

  const mockMoneyType: MoneyType = {
    code: 'USD',
    // add other required properties of MoneyType here
  } as MoneyType;

  const mockApiUrl = 'http://clematis.com';

  beforeEach(() => {
    // Create mocks for the service dependencies
    httpClientMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    environmentServiceMock = {
      getValue: jest.fn().mockReturnValue(mockApiUrl),
    } as unknown as jest.Mocked<EnvironmentService>;

    // Instantiate service manually to avoid heavy Angular TestBed overhead in Jest
    service = new DayService(httpClientMock, environmentServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUrl', () => {
    it('should append the endpoint suffix to the environment base API URL', () => {
      const endpoint = '/test-endpoint';
      const result = service.getUrl(endpoint);

      expect(environmentServiceMock.getValue).toHaveBeenCalledWith('apiUrl');
      expect(result).toBe(`${mockApiUrl}${endpoint}`);
    });
  });

  describe('getIncomeSumByDay', () => {
    it('should make an HTTP GET request with correct URL and params when day is provided', (done) => {
      const targetDate = '2026-07-09';
      const expectedResponse = 1500.5;

      httpClientMock.get.mockReturnValue(of(expectedResponse));

      service
        .getIncomeSumByDay(targetDate, mockMoneyType)
        .subscribe((response) => {
          expect(response).toBe(expectedResponse);
          expect(httpClientMock.get).toHaveBeenCalledWith(
            `${mockApiUrl}/incomeItems/search/sumDailyIncome`,
            {
              params: {
                targetDate: targetDate,
                moneyCode: mockMoneyType.code,
              },
            },
          );
          done();
        });
    });

    it('should immediately return of(0) without calling HTTP client if day is empty', (done) => {
      service.getIncomeSumByDay('', mockMoneyType).subscribe((response) => {
        expect(response).toBe(0);
        expect(httpClientMock.get).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('getExpensesSumByDay', () => {
    it('should make an HTTP GET request with correct URL and params when day is provided', (done) => {
      const targetDate = '2026-07-09';
      const expectedResponse = 450.0;

      httpClientMock.get.mockReturnValue(of(expectedResponse));

      service
        .getExpensesSumByDay(targetDate, mockMoneyType)
        .subscribe((response) => {
          expect(response).toBe(expectedResponse);
          expect(httpClientMock.get).toHaveBeenCalledWith(
            `${mockApiUrl}/expenseItems/search/sumDailyExpenses`,
            {
              params: {
                targetDate: targetDate,
                moneyCode: mockMoneyType.code,
              },
            },
          );
          done();
        });
    });

    it('should immediately return of(0) without calling HTTP client if day is empty', (done) => {
      service.getExpensesSumByDay('', mockMoneyType).subscribe((response) => {
        expect(response).toBe(0);
        expect(httpClientMock.get).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
