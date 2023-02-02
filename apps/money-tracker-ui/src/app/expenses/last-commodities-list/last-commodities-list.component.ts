import { Component, OnInit } from '@angular/core';
import { HateoasResourceService, PagedResourceCollection, Sort } from '@lagoshny/ngx-hateoas-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Entity, LastCommodity } from '@clematis-shared/model';
import { EntityListComponent } from '@clematis-shared/shared-components';
import { Observable, of, switchMap } from 'rxjs';
import { Title } from "@angular/platform-browser";
import { Utils } from '@clematis-shared/model';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

@Component({
  selector: 'app-last-commodities-list',
  templateUrl: 'last-commodities-list.component.html',
  styleUrls: ['last-commodities-list.component.sass'],
})
export class LastCommoditiesListComponent extends EntityListComponent<LastCommodity> implements OnInit {

  displayedColumns: string[] = ['daysAgo', 'transferdate', 'name', 'price', 'qty', 'organizationname'];

  constructor(resourceService: HateoasResourceService,
              router: Router, route: ActivatedRoute, private title: Title) {
    super(LastCommodity, resourceService, router, route)
  }

  ngOnInit(): void {
    super._ngOnInit()
    this.title.setTitle('Last Commodities')
  }

  override queryData(): Observable<PagedResourceCollection<LastCommodity>> {
    return super.queryData().pipe(
      switchMap((arr: PagedResourceCollection<LastCommodity>) => {
        arr.resources = arr.resources.map((lastCommodity: LastCommodity) => {
          if (lastCommodity.commodity) {
            lastCommodity.commodityLink
              = Entity.getRelativeLinkHref(Utils.removeProjection(lastCommodity.commodity.getSelfLinkHref()))
          }
          if (lastCommodity.organization) {
            lastCommodity.organizationLink
              = Entity.getRelativeLinkHref(Utils.removeProjection(lastCommodity.organization.getSelfLinkHref()))
          }
          lastCommodity.transactionDate = dayjs(lastCommodity.transactionDate, "DD-MM-YYYY HH:mm:ss", true).toDate();
          return lastCommodity
        })
        return of(arr);
      })
    )
  }

  getDaysAgo(daysAgo: number) {
    return Utils.getFormattedStringFromDays(daysAgo)
  }

  override getSortOption() {
    let ret: Sort = {
      daysAgo: 'ASC'
    }
    return ret
  }

}
