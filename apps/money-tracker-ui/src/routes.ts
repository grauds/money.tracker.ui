
import { Routes } from '@angular/router';
import { PageNotFoundComponent } from '@clematis-shared/shared-components';

import { canActivate } from './app/auth/auth.guard';

import { AboutComponent } from './app/about/about.component';
import { AccountsDashboardComponent } from './app/accounts/accounts-dashboard/accounts-dashboard.component';
import { AgentCommoditiesComponent } from './app/expenses/agent-commodities/agent-commodities.component';
import { BalanceComponent } from './app/expenses/balance/balance.component';
import { ExchangeComponent } from './app/accounts/exchange/exchange.component';
import { ExpensesListComponent } from './app/expenses/expences-list/expenses-list.component';
import { CommoditiesListComponent } from './app/commodities/commodities-list/commodities-list.component';
import { CommodityGroupListComponent } from './app/commodities/commodity-group-list/commodity-group-list.component';
import { CommodityGroupComponent } from './app/commodities/commodity-group/commodity-group.component';
import { CommodityComponent } from './app/commodities/commodity/commodity.component';
import { InOutListComponent } from './app/expenses/in-out-list/in-out-list.component';
import { LastCommoditiesListComponent } from './app/expenses/last-commodities-list/last-commodities-list.component';
import { IncomeMonthlyComponent } from './app/income/income-monthly/income-monthly.component';
import { MainComponent } from './app/main/main.component';
import { OrganizationGroupListComponent } from './app/organizations/organization-group-list/organization-group-list.component';
import { OrganizationGroupComponent } from './app/organizations/organization-group/organization-group.component';
import { OrganizationComponent } from './app/organizations/organization/organization.component';
import { OrganizationsListComponent } from './app/organizations/organizations-list/organizations-list.component';
import { WorkspaceComponent } from './app/workspace/workspace.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/about',
  },
  {
    path: 'about',
    pathMatch: 'full',
    component: AboutComponent,
  },
  {
    path: 'main',
    canActivate: [canActivate],
    component: MainComponent,
  },
  {
    path: 'balance',
    canActivate: [canActivate],
    component: BalanceComponent,
  },
  {
    path: '',
    canActivate: [canActivate],
    component: WorkspaceComponent,
    children: [
      {
        path: 'accounts',
        component: AccountsDashboardComponent,
        pathMatch: 'full',
      },
      {
        path: 'commodities/:id',
        component: CommodityComponent,
      },
      {
        path: 'commodities',
        component: CommoditiesListComponent,
        pathMatch: 'full',
      },
      {
        path: 'commodityGroups',
        component: CommodityGroupListComponent,
        pathMatch: 'full',
      },
      {
        path: 'lastCommodities',
        component: LastCommoditiesListComponent,
        pathMatch: 'full',
      },
      {
        path: 'commodityGroups/:id',
        component: CommodityGroupComponent,
      },
      {
        path: 'expenses',
        component: ExpensesListComponent,
      },
      {
        path: 'income',
        component: IncomeMonthlyComponent,
      },
      {
        path: 'commoditiesAgents',
        component: AgentCommoditiesComponent,
      },
      {
        path: 'inOut',
        component: InOutListComponent,
      },
      {
        path: 'exchange',
        component: ExchangeComponent,
      },
      {
        path: 'organizations',
        component: OrganizationsListComponent,
        pathMatch: 'full',
      },
      {
        path: 'organizations/:id',
        component: OrganizationComponent,
      },
      {
        path: 'organizationGroups',
        component: OrganizationGroupListComponent,
        pathMatch: 'full',
      },
      {
        path: 'organizationGroups/:id',
        component: OrganizationGroupComponent,
      },
    ],
  },
  { path: '**', component: PageNotFoundComponent },
];
export const appRoutes = routes;
