import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MoneyType } from '@clematis-shared/model';
import { HttpClient } from '@angular/common/http';
import {
  HateoasResourceService,
  PagedResourceCollection,
  PagedGetOption
} from '@lagoshny/ngx-hateoas-client';

import { SearchService } from './search.service';
import { EnvironmentService } from './environment.service';

@Injectable()
export class MoneyTypeService extends SearchService<MoneyType> {
  constructor(
    private http: HttpClient,
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService
  ) {
    super(environmentService);
  }

  searchPage(
    options: PagedGetOption | undefined,
    queryName: string
  ): Observable<PagedResourceCollection<MoneyType>> {
    return this.hateoasService.searchPage<MoneyType>(
      MoneyType,
      queryName,
      options
    );
  }

  getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<MoneyType>> {
    return this.hateoasService.getPage<MoneyType>(MoneyType, options);
  }

  getCurrencyByCode(code: string): Observable<MoneyType> {
    return this.hateoasService.searchResource<MoneyType>(
      MoneyType,
      'findByCode',
      {
        params: {
          code: code,
        },
      }
    );
  }
}
