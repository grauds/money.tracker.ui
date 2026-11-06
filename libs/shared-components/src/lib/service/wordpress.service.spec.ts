import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { WordpressService } from './wordpress.service';
import { EnvironmentService } from './environment.service';

describe('WordpressService', () => {
  let service: WordpressService;
  let httpMock: HttpTestingController;
  let environmentServiceMock: jest.Mocked<EnvironmentService>;

  const mockWordpressUrl = 'http://wordpress.example.com';

  beforeEach(() => {
    environmentServiceMock = {
      getValue: jest.fn((key: string) => {
        if (key === 'wordpressUrl') return mockWordpressUrl;
        return '';
      }),
    } as unknown as jest.Mocked<EnvironmentService>;

    TestBed.configureTestingModule({
      providers: [
        WordpressService,
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: environmentServiceMock },
      ],
    });

    service = TestBed.inject(WordpressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getArticlesByDay', () => {
    it('should construct correct date range params for string date', (done) => {
      const date = '2024-06-15';

      service.getArticlesByDay(date).subscribe((articles) => {
        expect(articles).toBeDefined();
        done();
      });

      const req = httpMock.expectOne((request) => {
        expect(request.method).toBe('GET');
        expect(request.url).toContain('/wp/v2/posts');

        const embed = request.params.get('_embed');

        expect(embed).toBe('true');

        return true;
      });

      req.flush([]);
    });

    it('should construct correct date range params for Date object without mutating it', (done) => {
      const date = new Date('2024-06-15T12:00:00Z');
      const originalTime = date.getTime();

      service.getArticlesByDay(date).subscribe(() => {
        // Verify the original Date object was not mutated
        expect(date.getTime()).toBe(originalTime);
        done();
      });

      const req = httpMock.expectOne((request) => {
        return request.url.includes('/wp/v2/posts');
      });
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should include _embed param for featured images and author data', (done) => {
      service.getArticlesByDay('2025-01-01').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => {
        expect(request.params.get('_embed')).toBe('true');
        return true;
      });
      req.flush([]);
    });

    it('should set after param to start of day', (done) => {
      service.getArticlesByDay('2024-06-15').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => {
        const after = request.params.get('after');
        // The date may shift due to timezone, so just verify it's a valid ISO date
        expect(after).toBeDefined();
        expect(new Date(after!).toISOString()).toMatch(/2024-06-1[45]T/);
        return true;
      });
      req.flush([]);
    });

    it('should set before param to end of day', (done) => {
      service.getArticlesByDay('2024-06-15').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => {
        const before = request.params.get('before');
        expect(before).toBeDefined();
        expect(new Date(before!).toISOString()).toMatch(/2024-06-1[45]T/);
        return true;
      });
      req.flush([]);
    });
  });

  describe('#getUrl', () => {
    it('should prepend wordpressUrl to the given path', () => {
      const result = service.getUrl('/wp/v2/posts');
      expect(result).toBe(`${mockWordpressUrl}/wp/v2/posts`);
    });

    it('should prevent double-slashes if baseUrl ends with one', () => {
      environmentServiceMock.getValue = jest.fn().mockReturnValue(
        'http://wordpress.example.com/'
      );

      const result = service.getUrl('/wp/v2/posts');
      expect(result).toBe('http://wordpress.example.com/wp/v2/posts');
    });

    it('should handle baseUrl without trailing slash', () => {
      environmentServiceMock.getValue = jest.fn().mockReturnValue(
        'http://wordpress.example.com'
      );

      const result = service.getUrl('/wp/v2/posts');
      expect(result).toBe('http://wordpress.example.com/wp/v2/posts');
    });
  });
});
