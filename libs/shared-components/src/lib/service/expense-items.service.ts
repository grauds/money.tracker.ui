import { Injectable } from '@angular/core';
import { Entity, ExpenseItem } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection
} from "@lagoshny/ngx-hateoas-client";
import { Observable, of, switchMap } from "rxjs";
import { SearchService } from './search.service';
import { HttpClient } from "@angular/common/http";

@Injectable()
export class ExpenseItemsService extends SearchService<ExpenseItem> {

  constructor(private http: HttpClient, private hateoasService: HateoasResourceService) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<ExpenseItem>> {

    return this.hateoasService.searchPage<ExpenseItem>(ExpenseItem, queryName, options).pipe(
      this.postprocess()
    )
  }

  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<ExpenseItem>> {
    return this.hateoasService.getPage<ExpenseItem>(ExpenseItem, options).pipe(
      this.postprocess()
    )
  }

  postprocess() {
    return switchMap((arr: PagedResourceCollection<ExpenseItem>) => {
      arr.resources = arr.resources.map((expense: ExpenseItem) => {
        expense.commodityLink = Entity.getRelativeSelfLinkHref(expense.commodity)
        expense.tradeplaceLink = Entity.getRelativeSelfLinkHref(expense.tradeplace)
        return expense
      })
      return of(arr)
    });
  }

  getCommodityExpences(commodityId: string | null): Observable<ResourceCollection<ExpenseItem>> {

    if (commodityId) {
      return this.hateoasService.searchPage<ExpenseItem>(ExpenseItem,'commodity', {
        params: {
          commodityId: commodityId
        }
      })
    } return of(new ResourceCollection<ExpenseItem>())
  }

  getOrganizationExpences(organizationId: string | null)
    : Observable<ResourceCollection<ExpenseItem>> {

    if (organizationId) {
      return this.hateoasService.searchPage<ExpenseItem>(ExpenseItem, 'tradeplace', {
        params: {
          tradeplaceId: organizationId
        }
      })
    } return of(new ResourceCollection<ExpenseItem>())
  }
}
