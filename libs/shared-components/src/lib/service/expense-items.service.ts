import { Injectable } from '@angular/core';
import { Commodity, Entity, ExpenseItem, Organization } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection
} from "@lagoshny/ngx-hateoas-client";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
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
      switchMap((arr: PagedResourceCollection<ExpenseItem>) => {
        return forkJoin(arr.resources.map((expense: ExpenseItem) => {
          return expense.getRelation<Commodity>('commodity')
            .pipe(
              map((commodity: Commodity) => {
                expense.commodity = commodity
                expense.commodityLink = Entity.getRelativeSelfLinkHref(commodity)
                return expense
              }),
              catchError(() => of(expense))
            )
        })).pipe(
          switchMap((expenses: ExpenseItem[]) => {
            return forkJoin(expenses.map((expense: ExpenseItem) => {
              return expense.getRelation<Organization>('tradeplace')
                .pipe(
                  map((organization: Organization) => {
                    expense.tradeplace = organization
                    expense.tradeplaceLink = Entity.getRelativeSelfLinkHref(organization)
                    return expense
                  })
                )
            })).pipe(
              switchMap((expenses: ExpenseItem[]) => {
                arr.resources = expenses
                return of(arr)
              })
            )
          })
        )
      })
    )
  }

  getPage(options: PagedGetOption | undefined): Observable<PagedResourceCollection<ExpenseItem>> {
    return this.hateoasService.getPage<ExpenseItem>(ExpenseItem, options);
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
