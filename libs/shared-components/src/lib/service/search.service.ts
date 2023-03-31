import { BehaviorSubject, Observable } from "rxjs";
import { PagedResourceCollection, Resource } from "@lagoshny/ngx-hateoas-client";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { EnvironmentService } from "./environment.service";

export type SearchPostProcessingHandler<T extends Resource>
  = (res: PagedResourceCollection<T>) => Observable<PagedResourceCollection<T>>;

export abstract class SearchService<T extends Resource> {

  private statusDescription$ = new BehaviorSubject<string>("search")

  private searchPostProcessingHandler: SearchPostProcessingHandler<T> | null = null

  environmentService: EnvironmentService;

  private _pageLoading: boolean = false

  protected constructor(environmentService: EnvironmentService) {
    this.environmentService = environmentService;
  }

  abstract searchPage(options?: PagedGetOption, queryName?: string | null)
                                            : Observable<PagedResourceCollection<T>>

  abstract getPage(options?: PagedGetOption): Observable<PagedResourceCollection<T>>

  setProcessingStatusDescription(message: string): void {
    this.statusDescription$.next(message)
  }

  getStatusDescription() {
    return this.statusDescription$
  }

  getUrl(url: string) :string {
    return this.environmentService.getValue('apiUrl') + url
  }

  getPostProcessingStream(): SearchPostProcessingHandler<T> | null {
    return this.searchPostProcessingHandler
  }

  setPostProcessingStream(handler: SearchPostProcessingHandler<T>): void {
    this.searchPostProcessingHandler = handler
  }

  get pageLoading(): boolean {
    return this._pageLoading;
  }

  set pageLoading(value: boolean) {
    this._pageLoading = value;
  }
}
