import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
} from '@lagoshny/ngx-hateoas-client';
import {
  Entity,
  ExpenseItem,
  MoneyTypes,
  Organization,
  OrganizationGroup,
} from '@clematis-shared/model';
import {
  EntityComponent,
  ExpenseItemsService,
  OrganizationGroupsService,
  OrganizationsService,
} from '@clematis-shared/shared-components';
import { Title } from '@angular/platform-browser';
import { Utils } from '@clematis-shared/model';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.sass'],
  providers: [{ provide: 'searchService', useClass: ExpenseItemsService }],
})
export class OrganizationComponent
  extends EntityComponent<Organization>
  implements OnInit
{
  displayedColumns: string[] = ['transferdate', 'name', 'price', 'qty'];

  parent: OrganizationGroup | undefined;

  parentLink: string | undefined;

  path: Array<OrganizationGroup> = [];

  totalSum = 0;

  expenses: ExpenseItem[] = [];

  loading = false;

  option: any = {};

  constructor(
    resourceService: HateoasResourceService,
    private expenseItemsService: ExpenseItemsService,
    private organizationsService: OrganizationsService,
    private organizationGroupsService: OrganizationGroupsService,
    route: ActivatedRoute,
    router: Router,
    title: Title
  ) {
    super(Organization, resourceService, route, router, title);
  }

  ngOnInit(): void {
    this.loading = true;
    this.onInit();
  }

  override setEntity(entity: Organization) {
    super.setEntity(entity);

    this.entity
      ?.getRelation<OrganizationGroup>('parent')
      .subscribe((parent: OrganizationGroup) => {
        this.parent = parent;
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent);
        this.organizationGroupsService
          .getPathForOrganizationGroup(Utils.getIdFromSelfUrl(this.parent))
          .subscribe((response) => {
            this.path = response.resources.reverse();
            if (this.parent) {
              this.path.push(this.parent);
            }
          });
      });

    this.organizationsService
      .getTotalsForOrganization(this.id, MoneyTypes.RUB)
      .subscribe((response) => {
        this.totalSum = response;
      });
  }

  setLoading($event: boolean) {
    this.loading = $event;
  }

  getQueryArguments(): RequestParam {
    return {
      tradeplaceId: this.id ? this.id : '',
    };
  }

  setEntities($event: ExpenseItem[]) {
    this.expenses = $event;
    this.option = this.getData();
  }

  getData() {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: any) {
          if (params) {
            return params
              .map((param: any) => {
                return (
                  param.seriesName + ' : ' + Math.round(param.value * 100) / 100
                );
              })
              .join('<br/>');
          }
          return 'No params';
        },
      },
      xAxis: {
        type: 'category',
        data: this.expenses.map((expense) => {
          return formatDate(
            expense.transferDate,
            'shortDate',
            navigator.language
          );
        }),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Total',
          data: this.expenses.map((expense) => {
            return expense.qty * expense.price;
          }),
          type: 'line',
        },
        {
          name: 'Price',
          data: this.expenses.map((expense) => {
            return expense.price;
          }),
          type: 'line',
        },
      ],
    };
  }
}
