import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import {
  HateoasResourceService,
  RequestParam,
} from '@lagoshny/ngx-hateoas-client';
import {
  CommodityGroup,
  ExpenseItem,
  Organization,
  OrganizationGroup
} from "@clematis-shared/model";
import {
  EntityComponent, EntityService,
  ExpenseItemsService,
  OrganizationGroupsService,
  OrganizationsService,
  PARENT_RESOURCE_TYPE,
  RESOURCE_TYPE
} from "@clematis-shared/shared-components";
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.sass'],
  providers: [
    { provide: 'searchService', useClass: ExpenseItemsService },
    EntityService,
    { provide: PARENT_RESOURCE_TYPE, useValue: CommodityGroup },
    { provide: RESOURCE_TYPE, useValue: Organization }
  ],
  standalone: false,
})
export class OrganizationComponent
  extends EntityComponent<Organization, OrganizationGroup>
  implements OnInit, OnDestroy
{
  displayedColumns: string[] = ['transferdate', 'name', 'price', 'qty'];

  expenses: ExpenseItem[] = [];

  option: any = {};

  constructor(
    resourceService: HateoasResourceService,
    private readonly organizationsService: OrganizationsService,
    private readonly organizationGroupsService: OrganizationGroupsService,
    entityService: EntityService<Organization, OrganizationGroup>,
    route: ActivatedRoute,
    router: Router,
    title: Title
  ) {
    super(Organization, resourceService, route, router, title, entityService);
  }

  getQueryArguments(): RequestParam {
    return {
      id: this.id ? this.id : '',
    };
  }

  setEntities($event: ExpenseItem[]) {
    setTimeout(() => {
      this.expenses = $event;
      this.option = this.getData();
    })
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
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
      legend: {
        data: ['Total', 'Price'],
        bottom: 0
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
