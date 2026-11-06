import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { WeatherService } from './weather.service';
import { EnvironmentService } from './environment.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;
  let environmentServiceMock: jest.Mocked<EnvironmentService>;

  const mockWeatherUrl = 'http://weather-api.example.com/api';

  beforeEach(() => {
    environmentServiceMock = {
      getValue: jest.fn((key: string) => {
        if (key === 'weatherUrl') return mockWeatherUrl;
        return '';
      }),
    } as unknown as jest.Mocked<EnvironmentService>;

    TestBed.configureTestingModule({
      providers: [
        WeatherService,
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: environmentServiceMock },
      ],
    });

    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getDay', () => {
    it('should construct correct URL with station day and hour parameters', (done) => {
      const dayTime = '2024-06-15';

      service.getDay(dayTime).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes('findByStationDayAndHour') &&
          request.url.includes('stationId=27612') &&
          request.url.includes('2024-06-15')
      );
      expect(req.request.method).toBe('GET');
      req.flush({ resources: [] });
    });

    it('should always use stationId=27612 and hour 09:00:00', (done) => {
      service.getDay('2025-01-01').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes('stationId=27612') &&
          request.url.includes('09:00:00')
      );
      expect(req.request.method).toBe('GET');
      req.flush({ resources: [] });
    });
  });

  describe('#getImage', () => {
    it('should request a blob response for weather image', (done) => {
      const day = '2024-06-15';
      const mockBlob = new Blob(['image-data'], { type: 'image/png' });

      service.getImage(day).subscribe((blob) => {
        expect(blob).toBe(mockBlob);
        done();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes('image/similar') &&
          request.url.includes('profile=PHOTO')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('#getUrl', () => {
    it('should prepend weatherUrl to the given path', () => {
      const result = service.getUrl('/observations');
      expect(result).toBe(`${mockWeatherUrl}/observations`);
    });

    it('should handle paths without leading slash', () => {
      const result = service.getUrl('observations');
      // The service concatenates directly, so no slash is added
      expect(result).toBe(`${mockWeatherUrl}observations`);
    });
  });
});
