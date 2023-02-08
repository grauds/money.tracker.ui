import { Injectable } from '@angular/core';
import { MoneyTypes, Organization } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { Observable, of } from "rxjs";
import { HateoasResourceService, PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";

import { SearchService } from './search.service';
import { HttpClient } from "@angular/common/http";

@Injectable()
export class OrganizationsService extends SearchService<Organization> {

  constructor(private http: HttpClient, private hateoasService: HateoasResourceService) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<Organization>> {
    return this.hateoasService.searchPage<Organization>(Organization, queryName, options);
  }

  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<Organization>> {
    return this.hateoasService.getPage<Organization>(Organization, options);
  }

  getTotalsForOrganization(organizationId: string | null,
                           moneyCode: MoneyTypes): Observable<number> {
    if (organizationId) {
      return this.http.get<number>(this.getUrl('/expenseItems/search/sumOrganizationExpenses'), {
        params: {
          organizationId: organizationId,
          moneyCode: moneyCode
        }
      })
    } return of(0)
  }

}
