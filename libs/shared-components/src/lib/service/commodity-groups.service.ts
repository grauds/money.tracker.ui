import { Injectable } from '@angular/core';
import { SearchService } from './search.service';
import { CommodityGroup } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { Observable } from "rxjs";
import { HateoasResourceService,
  PagedResourceCollection
} from "@lagoshny/ngx-hateoas-client";
import { HttpClient } from "@angular/common/http";
import { EnvironmentService } from "./environment.service";

@Injectable()
export class CommodityGroupsService extends SearchService<CommodityGroup> {

  constructor(private http: HttpClient,
              private hateoasService: HateoasResourceService,
              override environmentService: EnvironmentService) {
    super(environmentService);
  }


  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<CommodityGroup>> {
    return this.hateoasService.searchPage<CommodityGroup>(CommodityGroup, queryName, options);
  }

  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<CommodityGroup>> {
    return this.hateoasService.getPage<CommodityGroup>(CommodityGroup, options);
  }

}
