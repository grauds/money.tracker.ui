import { Component, OnInit } from '@angular/core';
import {HateoasResourceService, PagedResourceCollection, Sort} from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Commodity, Entity, LastCommodity } from '@clematis-shared/model';
import {EntityListComponent, Utils} from '@clematis-shared/shared-components';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Title } from "@angular/platform-browser";

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

@Component({
  selector: 'app-last-commodities-list',
  templateUrl: 'last-commodities-list.component.html',
  styleUrls: ['last-commodities-list.component.css'],
})
export class LastCommoditiesListComponent extends EntityListComponent<LastCommodity> implements OnInit {

  displayedColumns: string[] = ['daysAgo', 'transferdate', 'name', 'price', 'qty', 'organizationname'];

  constructor(resourceService: HateoasResourceService,
              router: Router, route: ActivatedRoute, private title: Title) {
    super(LastCommodity, resourceService, router, route)

    this.path = 'lastExpenseItems'
  }

  ngOnInit(): void {
    super._ngOnInit()
    this.title.setTitle('Last Commodities')
  }

  override queryData(): Observable<PagedResourceCollection<LastCommodity>> {
    return super.queryData().pipe(
      switchMap((arr: PagedResourceCollection<LastCommodity>) => {
        return forkJoin(arr.resources.map((lastCommodity: LastCommodity) => {
          return this.resourceService.getResource<Commodity>(Commodity, lastCommodity.commId)
            .pipe(
              map((commodity: Commodity) => {
                lastCommodity.commodity = commodity
                lastCommodity.commodityLink = Entity.getRelativeSelfLinkHref(commodity)
                return lastCommodity
              }),
              map(() => {
                lastCommodity.transactionDate = dayjs(lastCommodity.transactionDate, "DD-MM-YYYY HH:mm:ss", true).toDate();
                return lastCommodity
              }),
              catchError(() => of(lastCommodity))
            )
        })).pipe(
          switchMap((expenses: LastCommodity[]) => {
            arr.resources = expenses
            return of(arr)
          })
        )
      })
    )
  }

  getDaysAgo(daysAgo: number) {
    return Utils.getFormattedStringFromDays(daysAgo)
  }

  override getSortOption() {
    let ret: Sort = {
      daysAgo: 'DESC'
    }
    return ret
  }

}
