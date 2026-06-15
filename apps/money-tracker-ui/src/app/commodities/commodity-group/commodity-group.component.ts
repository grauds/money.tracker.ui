import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
  Sort,
} from '@lagoshny/ngx-hateoas-client';
import {
  CommodityGroup,
  MoneyTypes,
  Entity,
  ExpenseItem,
} from '@clematis-shared/model';
import {
  CommodityGroupService,
  EntityComponent,
  EntityListComponent,
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';
import { Utils } from '@clematis-shared/model';
import { catchError, EMPTY, forkJoin } from "rxjs";

@Component({
  selector: 'app-commodity-group',
  templateUrl: './commodity-group.component.html',
  styleUrls: ['./commodity-group.component.sass'],
  providers: [
    { provide: 'searchService', useClass: CommodityGroupService }
  ],
  standalone: false,
})
export class CommodityGroupComponent
  extends EntityComponent<CommodityGroup>
  implements OnInit
{
  @ViewChild(EntityListComponent)
  entityList!: EntityListComponent<CommodityGroup>;

  loading = false;

  parent: CommodityGroup | undefined;

  parentLink: string | undefined;

  children: Entity[] = [];

  totalSum: number | undefined;

  path: Array<CommodityGroup> = [];

  constructor(
    resourceService: HateoasResourceService,
    private readonly commodityGroupService: CommodityGroupService,
    route: ActivatedRoute,
    router: Router,
    title: Title
  ) {
    super(CommodityGroup, resourceService, route, router, title);
  }

  ngOnInit(): void {
    this.loading = true;
    this.onInit();
  }

  override setEntity(entity: CommodityGroup) {
    super.setEntity(entity);

    this.clearPreviousData();

    if (!this.entity) {
      return;
    }

    this.entityList?.refreshData({
      queryArguments: this.getQueryArguments(),
      queryName: 'recursiveByParentId',
    });

    const parent$ = this.entity?.getRelation<CommodityGroup>('parent')
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
            // No parent is a valid state → don’t show an error to the user
            this.parent = undefined;
            this.parentLink = undefined;
            return EMPTY;
          }
          // Other errors are real problems → let them propagate (or handle differently)
          throw err;
        })
      );

    const totals$ = this.commodityGroupService
      .getTotalsForCommodityGroup(this.id, MoneyTypes.RUB)
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
            return EMPTY;
          }
          throw err;
        })
      );

    this.commodityGroupService
      .getPathForCommodityGroup(Utils.getIdFromSelfUrl(this.entity))
      .subscribe((response) => {
        this.path = response.resources.reverse();
      });

    forkJoin({
      parent: parent$,
      totals: totals$
    }).subscribe({
      next: (result) => {
        if (result.parent) {
          this.parent = result.parent;
          this.parentLink = Entity.getRelativeSelfLinkHref(result.parent);
        }
        if (result.totals) {
          this.totalSum = result.totals;
          this.loading = false;
        }
      },
      error: (err) => console.error('An error occurred loading commodity group data', err)
    });
  }

  private clearPreviousData() {
    this.parent = undefined;
    this.parentLink = undefined;
    this.path = [];
    this.totalSum = undefined;
  }

  setLoading($event: boolean) {
    setTimeout(() => {
      this.loading = $event;
    });
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  setEntities($event: ExpenseItem[]) {
    setTimeout(() => {
      this.children = $event;
    })
  }

  getSort(): Sort {
    return {
      name: 'ASC',
    };
  }
}
