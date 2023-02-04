import { Injectable } from '@angular/core';
import { HateoasService, SearchService } from "@clematis-shared/shared-components";
import { Commodity, Entity, ExpenseItem, Organization } from "@clematis-shared/model";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";

@Injectable()
export class ExpenseItemsService extends SearchService<ExpenseItem> {

  constructor(private hateoasService: HateoasService<ExpenseItem>) {
    super();
  }

  searchPage(options: PagedGetOption | undefined, queryName: string | undefined):
    Observable<PagedResourceCollection<ExpenseItem>> {

    return this.hateoasService.searchPage(options, queryName).pipe(
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
}
