import { Injectable } from '@angular/core';
import { CommodityGroup } from '@clematis-shared/model';
import {
  HateoasResourceService,
  PagedResourceCollection,
  PagedGetOption
} from '@lagoshny/ngx-hateoas-client';
import { Observable } from 'rxjs';
import { SearchService } from './search.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable()
export class CommodityGroupsService extends SearchService<CommodityGroup> {
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
  ): Observable<PagedResourceCollection<CommodityGroup>> {
    return this.hateoasService.searchPage<CommodityGroup>(
      CommodityGroup,
      queryName,
      options
    );
  }

  getPage(
    options: PagedGetOption | undefined
  ): Observable<PagedResourceCollection<CommodityGroup>> {
    return this.hateoasService.getPage<CommodityGroup>(CommodityGroup, options);
  }
}
