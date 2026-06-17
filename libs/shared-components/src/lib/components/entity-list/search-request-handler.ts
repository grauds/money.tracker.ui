import { EventEmitter } from "@angular/core";
import { Observable, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { SearchService } from "../../service/search.service";
import { Entity, SearchRequest } from "@clematis-shared/model";
import {
  PagedResourceCollection,
  Sort as RestSort,
} from '@lagoshny/ngx-hateoas-client';

/**
 * Handles search requests and manages the search pipeline
 * for executing and processing search queries.
 *
 * @template T The type of entity being managed by the SearchService.
 */
export class SearchRequestHandler<T extends Entity> {
  constructor(private searchService: SearchService<T>) {}

  public createSearchPipeline(
    searchRequest$: EventEmitter<SearchRequest | undefined>,
    stateProvider: () => {
      n: number;
      limit: number;
      sort: RestSort | null;
      filter: Map<string, string>
    },
    onSuccess: (page: PagedResourceCollection<T>) => void,
    onError: (err: any) => void,
    onComplete: () => void
  ) {
    return searchRequest$
      .pipe(
        tap(() => this.searchService.setProcessingStatusDescription('search')),
        switchMap((searchRequest) => {
          const state = stateProvider();
          const baseParams = {
            pageParams: { page: state.n, size: state.limit },
            sort: state.sort ?? {},
            useCache: true
          };

          if (searchRequest?.queryName) {
            const filterParams: Record<string, string> = {};
            state.filter.forEach((v, k) => { filterParams[k] = v; });

            return this.searchService.searchPage(
              {
                ...baseParams,
                params: {
                  ...searchRequest.queryArguments,
                  ...filterParams,
                  ...searchRequest.filterParams,
                },
              },
              searchRequest.queryName
            );
          }
          return this.searchService.getPage(baseParams);
        }),
        switchMap((results) => this.executePostProcessing(results))
      )
      .subscribe({
        next: onSuccess,
        error: onError,
        complete: onComplete
      });
  }

  private executePostProcessing(searchResult: PagedResourceCollection<T>):
    Observable<PagedResourceCollection<T>> {

    const handler
      = this.searchService.getPostProcessingStream();

    if (handler) {
      this.searchService.setProcessingStatusDescription('post processing');
      return handler(searchResult);
    }
    return of(searchResult);
  }
}
