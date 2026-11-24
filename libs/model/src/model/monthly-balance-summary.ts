import { HateoasResource, Resource } from '@lagoshny/ngx-hateoas-client';

@HateoasResource('monthlyDeltas')
export class MonthlyBalanceSummary extends Resource {
  accountId = 0;

  accountName = '';

  code = '';

  year = 0;

  month = 0;

  delta = 0;

  deltaOrig = 0;

  deltaTarget = 0;

  balanceOrig = 0;

  balanceTarget = 0;

  monthTotalDeltaTarget = 0;

  monthTotalBalanceTarget = 0;
}
