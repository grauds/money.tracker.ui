import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HateoasResourceService, RequestParam } from '@lagoshny/ngx-hateoas-client';
import { Entity, ExpenseItem, MoneyTypes, Organization, OrganizationGroup } from '@clematis-shared/model';
import {
  EntityComponent,
  ExpenseItemsService,
  OrganizationGroupsService,
  OrganizationsService
} from '@clematis-shared/shared-components';
import { Title } from "@angular/platform-browser";
import { Utils } from '@clematis-shared/model';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.sass'],
  providers: [
    { provide: 'searchService', useClass: ExpenseItemsService }
  ]
})
export class OrganizationComponent extends EntityComponent<Organization> implements OnInit {

  displayedColumns: string[] = ['transferdate', 'name', 'price', 'qty'];

  parent: OrganizationGroup | undefined;

  parentLink: string | undefined;

  path: Array<OrganizationGroup> = [];

  totalSum: number = 0;

  expenses: ExpenseItem[] = [];

  loading: boolean = false;

  pageLoading: boolean = false;

  graph: any = {
    data: [{
      x: [],
      y: [],
      name: 'Total Sum',
      type: 'bar'
    }, {
      x: [],
      y: [],
      name: 'Price',
      type: 'bar'
    }],
    layout: {autosize: true, title: 'Money Spent'},
  };

  constructor(resourceService: HateoasResourceService,
              private expenseItemsService: ExpenseItemsService,
              private organizationsService: OrganizationsService,
              private organizationGroupsService: OrganizationGroupsService,
              route: ActivatedRoute,
              router: Router,
              title: Title) {
    super(Organization, resourceService, route, router, title)
  }

  ngOnInit(): void {
    this.onInit()
  }

  override setEntity(entity: Organization) {
    super.setEntity(entity)

    this.entity?.getRelation<OrganizationGroup>('parent')
      .subscribe((parent: OrganizationGroup) => {
        this.parent = parent
        this.parentLink = Entity.getRelativeSelfLinkHref(this.parent)
        this.organizationGroupsService.getPathForOrganizationGroup(Utils.getIdFromSelfUrl(this.parent)).subscribe((response) => {
          this.path = response.resources.reverse()
          if (this.parent) {
            this.path.push(this.parent)
          }
        })
      })

    this.organizationsService.getTotalsForOrganization(this.id, MoneyTypes.RUB).subscribe((response) => {
      this.totalSum = response
    })
  }

  setPageLoading($event: boolean) {
    this.pageLoading = $event
  }

  setLoading($event: boolean) {
    this.loading = $event
  }

  getQueryArguments(): RequestParam {
    return {
      tradeplaceId: this.id ? this.id : ''
    }
  }

  setEntities($event: ExpenseItem[]) {
    this.expenses = $event

    this.graph.data[0].x = []
    this.graph.data[0].y = []

    this.graph.data[1].x = []
    this.graph.data[1].y = []

    this.expenses.forEach(expense => {
      this.graph.data[0].x.push(expense.transferDate)
      this.graph.data[0].y.push(expense.total)

      this.graph.data[1].x.push(expense.transferDate)
      this.graph.data[1].y.push(expense.price)
    })
  }
}
