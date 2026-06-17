import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { SearchRequestHandler } from './search-request-handler';

describe('SearchRequestHandler', () => {
  let mockSearchService: any;
  let searchRequestEmitter: EventEmitter<any>;

  beforeEach(() => {
    searchRequestEmitter = new EventEmitter<any>();
    mockSearchService = {
      setProcessingStatusDescription: jest.fn(),
      getPostProcessingStream: jest.fn().mockReturnValue(null),
      getPage: jest.fn().mockReturnValue(of({ totalElements: 100, pageSize: 10, resources: [] }))
    };
  });

  it('should initialize a clean data fetching sequence running directly down to page targets', () => {
    const handler = new SearchRequestHandler(mockSearchService);
    const mockState = { n: 0, limit: 10, sort: null, filter: new Map() };
    const successSpy = jest.fn();

    handler.createSearchPipeline(
      searchRequestEmitter,
      () => mockState,
      successSpy,
      () => { /* empty */ },
      () => { /* empty */ }
    );

    searchRequestEmitter.next(undefined);

    expect(mockSearchService.setProcessingStatusDescription).toHaveBeenCalledWith('search');
    expect(mockSearchService.getPage).toHaveBeenCalled();
    expect(successSpy).toHaveBeenCalled();
  });
});
