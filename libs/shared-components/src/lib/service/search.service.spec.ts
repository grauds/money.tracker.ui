import { PagedGetOption, PagedResourceCollection, Resource } from '@lagoshny/ngx-hateoas-client';
import { Observable, of } from 'rxjs';

import { SearchService, SearchPostProcessingHandler } from './search.service';


class TestResource extends Resource {}

class TestSearchService extends SearchService<TestResource> {
  searchPage(options?: PagedGetOption, 
         queryName?: string | null): Observable<PagedResourceCollection<TestResource>> {
    return of({} as PagedResourceCollection<TestResource>);
  }

  getPage(options?: PagedGetOption): Observable<PagedResourceCollection<TestResource>> {
    return of({} as PagedResourceCollection<TestResource>);
  }
}

describe('SearchService', () => {
  let service: TestSearchService;
  let environmentServiceMock: any;

  beforeEach(() => {
    environmentServiceMock = {
      getValue: jest.fn().mockReturnValue('http://api.url')
    };

    service = new TestSearchService(environmentServiceMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get processing status description', () => {
    service.setProcessingStatusDescription('loading');
    service.getStatusDescription().subscribe((status) => {
      expect(status).toBe('loading');
    });
  });

  it('should return the correct URL', () => {
    const url = service.getUrl('/test');
    expect(url).toBe('http://api.url/test');
  });

  it('should set and get post processing stream', () => {
    const handler: SearchPostProcessingHandler<TestResource> = (res) => of(res);
    service.setPostProcessingStream(handler);
    expect(service.getPostProcessingStream()).toBe(handler);
  });

  it('should set and get page loading status', () => {
    service.pageLoading = true;
    expect(service.pageLoading).toBe(true);

    service.pageLoading = false;
    expect(service.pageLoading).toBe(false);
  });
});
