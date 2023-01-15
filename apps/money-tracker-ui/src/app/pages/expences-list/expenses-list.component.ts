import {Component, OnInit} from '@angular/core';
import {HateoasResourceService, PagedResourceCollection, Sort} from '@lagoshny/ngx-hateoas-client';
import {ActivatedRoute, Router} from '@angular/router';
import {Commodity, Entity, ExpenseItem, Organization} from '@clematis-shared/model';

import {EntityListComponent} from '@clematis-shared/shared-components';
import {forkJoin, Observable, map, switchMap, of, catchError} from 'rxjs';

@Component({
  selector: 'app-expenses-list',
  templateUrl: 'expenses-list.component.html',
  styleUrls: ['expenses-list.component.css']
})
export class ExpensesListComponent extends EntityListComponent<ExpenseItem> implements OnInit {

  displayedColumns: string[] = ['transferdate', 'name', 'price', 'qty', 'organizationname'];

  constructor(resourceService: HateoasResourceService, router: Router, route: ActivatedRoute) {
    super(ExpenseItem, resourceService, router, route)

    this.path = 'expenses'
  }

  ngOnInit(): void {
    super._ngOnInit()
  }

  override queryData(): Observable<PagedResourceCollection<ExpenseItem>> {
    return super.queryData().pipe(
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

  override getSortOption() {
    let ret: Sort = {
      transferDate: 'DESC'
    }
    return ret
  }
}
