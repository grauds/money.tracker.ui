import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Entity, ExpenseItem, MoneyTypes, Organization, OrganizationGroup } from '@clematis-shared/model';
import { EntityComponent } from '@clematis-shared/shared-components';
import { MoneyTrackerService } from "@clematis-shared/money-tracker-service";
import { Title } from "@angular/platform-browser";
import { Utils } from '@clematis-shared/model';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent extends EntityComponent<Organization> implements OnInit {

  parent: OrganizationGroup | undefined;

  parentLink: string | undefined;

  path: Array<OrganizationGroup> = [];

  totalSum: number = 0;

  expenses: ExpenseItem[] = [];

  graph: any = {
    data: [{
      x: [],
      y: [],
      name: 'Total Sum',
      type: 'scatter'
    }, {
      x: [],
      y: [],
      name: 'Price',
      type: 'scatter'
    }],
    layout: {autosize: true, title: 'Money Spent'},
  };

  constructor(resourceService: HateoasResourceService,
              private moneyTrackerService: MoneyTrackerService,
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
        this.moneyTrackerService.getPathForOrganizationGroup(Utils.getIdFromSelfUrl(this.parent)).subscribe((response) => {
          this.path = response.resources.reverse()
          if (this.parent) {
            this.path.push(this.parent)
          }
        })
      })

    this.moneyTrackerService.getTotalsForOrganization(this.id, MoneyTypes.RUB).subscribe((response) => {
      this.totalSum = response
    })

    this.moneyTrackerService.getOrganizationExpences(this.id).subscribe((response) => {
      this.expenses = response.resources

      this.expenses.forEach(expense => {
        this.graph.data[0].x.push(expense.transferDate)
        this.graph.data[0].y.push(expense.total)

        this.graph.data[1].x.push(expense.transferDate)
        this.graph.data[1].y.push(expense.price)
      })

    })
  }
}
