import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap, catchError } from 'rxjs';
import {
  HateoasResourceService,
  PagedResourceCollection,
  ResourceCollection,
} from '@lagoshny/ngx-hateoas-client';

import {
  AgentCommodities,
  CommodityPopularity,
  CurrencyExchangeStat,
  DashboardStats,
  IncomeMonthly,
  InfoAbout,
  InOutDelta,
  LastCommodity,
  MonthlyTrend,
  MoneyExchangeReport,
  MoneyType,
  OrganizationSpending,
  Page,
} from '@clematis-shared/model';

import { EnvironmentService } from './environment.service';
import { LastCommodityService } from './last-commodity.service';
import { InOutService } from './in-out.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private hateoasService: HateoasResourceService,
    private environmentService: EnvironmentService,
    private lastCommodityService: LastCommodityService,
    private inOutService: InOutService,
  ) {}

  private get apiUrl(): string {
    return this.environmentService.getValue('apiUrl');
  }

  private get infoUrl(): string {
    return this.environmentService.getValue('infoUrl');
  }

  // =====================================================================
  // Data fetching methods
  // =====================================================================

  /**
   * Fetches the basic info about the data (date range, transaction counts).
   */
  getInfoAbout(): Observable<InfoAbout> {
    return this.http.get<InfoAbout>(this.infoUrl + '/about');
  }

  /**
   * Fetches the total income sum for a given currency over a date range.
   */
  getTotalIncomeSum(
    moneyType: MoneyType,
    startDate: string,
    endDate: string
  ): Observable<number> {
    return this.http.get<number>(this.apiUrl + '/incomeItems/search/sumDailyIncome', {
      params: {
        moneyCode: moneyType.code,
        startDate: startDate,
        endDate: endDate,
      },
    });
  }

  /**
   * Fetches the total expenses sum for a given currency over a date range.
   */
  getTotalExpensesSum(
    moneyType: MoneyType,
    startDate: string,
    endDate: string
  ): Observable<number> {
    return this.http.get<number>(this.apiUrl + '/expenseItems/search/sumDailyExpenses', {
      params: {
        moneyCode: moneyType.code,
        startDate: startDate,
        endDate: endDate,
      },
    });
  }

  /**
   * Fetches monthly income report for building trend charts.
   */
  getIncomeMonthlyReport(
    moneyType: MoneyType,
    moisStart: number,
    anStart: number,
    moisEnd: number,
    anEnd: number
  ): Observable<ResourceCollection<IncomeMonthly>> {
    return this.hateoasService.searchCollection<IncomeMonthly>(IncomeMonthly, 'report', {
      params: {
        code: moneyType.code,
        moisStart,
        anStart,
        moisEnd,
        anEnd,
      },
    });
  }

  /**
   * Fetches expense breakdown by agent/commodity group.
   * Uses HttpClient since AgentCommodities is a DTO, not a HATEOAS resource.
   */
  getExpenseAgentReport(
    moneyType: MoneyType,
    moisStart: number,
    anStart: number,
    moisEnd: number,
    anEnd: number
  ): Observable<Page<AgentCommodities>> {
    return this.http.get<Page<AgentCommodities>>(this.apiUrl + '/agentCommodityGroupExpenses', {
      params: {
        code: moneyType.code,
        moisStart,
        anStart,
        moisEnd,
        anEnd,
      },
    });
  }

  /**
   * Fetches last commodity purchases for popularity analysis.
   */
  getLastCommodities(pageNumber: number, size: number): Observable<PagedResourceCollection<LastCommodity>> {
    return this.lastCommodityService.getPage({
      pageParams: {
        page: pageNumber,
        size: size,
      },
    });
  }

  /**
   * Fetches in-out deltas (debts) for the given currency.
   */
  getInOutDeltasInCurrency(moneyType: MoneyType): Observable<PagedResourceCollection<InOutDelta>> {
    return this.inOutService.getInOutDeltasInCurrency(moneyType);
  }

  /**
   * Fetches exchange report between two currencies.
   */
  getExchangeReport(source: MoneyType, dest: MoneyType): Observable<MoneyExchangeReport> {
    return this.http.get<MoneyExchangeReport>(this.infoUrl + '/exchange/search/report', {
      params: {
        source: source.code,
        dest: dest.code,
      },
    });
  }

  /**
   * Fetches average exchange rate between two currencies.
   */
  getAverageExchangeRate(source: MoneyType, dest: MoneyType): Observable<number> {
    return this.http.get<number>(this.infoUrl + '/exchange/search/average', {
      params: {
        source: source.code,
        dest: dest.code,
      },
    });
  }

  /**
   * Fetches top organizations by spending.
   */
  getTopOrganizations(
    moneyType: MoneyType,
    moisStart: number,
    anStart: number,
    moisEnd: number,
    anEnd: number
  ): Observable<OrganizationSpending[]> {
    return this.http.get<OrganizationSpending[]>(this.apiUrl + '/organizationExpenses/search', {
      params: {
        code: moneyType.code,
        moisStart,
        anStart,
        moisEnd,
        anEnd,
      },
    }).pipe(
      catchError(() => of([]))
    );
  }

  // =====================================================================
  // Data aggregation methods
  // =====================================================================

  /**
   * Aggregates all dashboard data from raw responses.
   */
  buildDashboardStats(
    infoAbout: InfoAbout,
    incomeSum: number,
    expensesSum: number,
    debtSum: number,
    debtCount: number,
    incomeCount: number,
    expenseCount: number
  ): DashboardStats {
    const netWorth = incomeSum - expensesSum - debtSum;
    const savingsRate = incomeSum > 0 ? ((incomeSum - expensesSum) / incomeSum) * 100 : 0;

    return {
      lastDataUpdate: infoAbout.dates?.end || null,
      totalIncomeCount: incomeCount,
      totalIncomeSum: incomeSum,
      totalExpenseCount: expenseCount,
      totalExpenseSum: expensesSum,
      totalDebtCount: debtCount,
      totalDebtSum: debtSum,
      netWorth: netWorth,
      savingsRate: Math.round(savingsRate * 100) / 100,
      dateRangeStart: infoAbout.dates?.start || null,
      dateRangeEnd: infoAbout.dates?.end || null,
    };
  }

  /**
   * Builds monthly trend data from income and expense monthly reports.
   */
  buildMonthlyTrends(
    incomeMonthly: ResourceCollection<IncomeMonthly>,
    expenseAgents: Page<AgentCommodities>
  ): MonthlyTrend[] {
    const incomeMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();

    // Build income map
    if (incomeMonthly?.resources) {
      for (const item of incomeMonthly.resources) {
        const key = item.year + '/' + item.month;
        incomeMap.set(key, item.totalConverted || 0);
      }
    }

    // Build expense map from agent commodities
    const expenseList = expenseAgents?.content || [];
    for (const agent of expenseList) {
      const key = agent.an + '/' + agent.mois;
      const current = expenseMap.get(key) || 0;
      expenseMap.set(key, current + agent.total);
    }

    // Collect all unique periods
    const allPeriods = new Set<string>([...incomeMap.keys(), ...expenseMap.keys()]);

    // Build trend array
    const trends: MonthlyTrend[] = [];
    for (const period of allPeriods) {
      trends.push({
        period,
        income: incomeMap.get(period) || 0,
        expenses: expenseMap.get(period) || 0,
        delta: (incomeMap.get(period) || 0) - (expenseMap.get(period) || 0),
      });
    }

    // Sort by period
    trends.sort((a, b) => a.period.localeCompare(b.period));

    return trends;
  }

  /**
   * Builds commodity popularity data from last commodity purchases.
   */
  buildCommodityPopularity(lastCommodities: PagedResourceCollection<LastCommodity>): CommodityPopularity[] {
    const commodityMap = new Map<string, CommodityPopularity>();

    if (!lastCommodities?.resources) {
      return [];
    }

    for (const lc of lastCommodities.resources) {
      const name = lc.commodity?.name || 'Unknown';

      const existing = commodityMap.get(name);
      if (existing) {
        existing.count++;
        existing.totalQty += lc.qty || 0;
        existing.totalSpent += (lc.qty || 0) * (lc.price || 0);
      } else {
        commodityMap.set(name, {
          commodityName: name,
          commodityGroup: 'Uncategorized',
          count: 1,
          totalQty: lc.qty || 0,
          totalSpent: (lc.qty || 0) * (lc.price || 0),
        });
      }
    }

    // Sort by count descending and take top 10
    return Array.from(commodityMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Calculates debt summary from in-out deltas.
   */
  buildDebtSummary(deltas: PagedResourceCollection<InOutDelta>): { sum: number; count: number } {
    if (!deltas?.resources) {
      return { sum: 0, count: 0 };
    }

    const nonZeroDeltas = deltas.resources.filter((d) => d.delta !== 0);
    const totalSum = nonZeroDeltas.reduce((sum, d) => sum + d.delta, 0);

    return {
      sum: totalSum,
      count: nonZeroDeltas.length,
    };
  }

  /**
   * Builds currency exchange statistics.
   */
  buildCurrencyExchangeStats(
    exchangeReport: MoneyExchangeReport,
    avgRate: number,
    sourceCurrency: string,
    destCurrency: string
  ): CurrencyExchangeStat {
    return {
      sourceCurrency,
      destCurrency,
      averageRate: avgRate,
      currentRate: exchangeReport.curRate,
      totalExchanged: exchangeReport.destAmount,
      delta: exchangeReport.delta,
    };
  }

  // =====================================================================
  // Main dashboard loading method
  // =====================================================================

  /**
   * Loads all dashboard data in parallel for the selected currency.
   * Returns an observable that emits when all data is loaded.
   */
  loadDashboardData(
    moneyType: MoneyType,
    startDate: string,
    endDate: string
  ): Observable<{
    stats: DashboardStats;
    trends: MonthlyTrend[];
    commodityPopularity: CommodityPopularity[];
    debtSummary: { sum: number; count: number };
    currencyExchangeStats: CurrencyExchangeStat[];
    infoAbout: InfoAbout;
  }> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const moisStart = start.getMonth() + 1;
    const anStart = start.getFullYear();
    const moisEnd = end.getMonth() + 1;
    const anEnd = end.getFullYear();

    // Fetch all data in parallel
    const observables = {
      infoAbout: this.getInfoAbout(),
      incomeSum: this.getTotalIncomeSum(moneyType, startDate, endDate),
      expensesSum: this.getTotalExpensesSum(moneyType, startDate, endDate),
      incomeMonthly: this.getIncomeMonthlyReport(moneyType, moisStart, anStart, moisEnd, anEnd),
      expenseAgents: this.getExpenseAgentReport(moneyType, moisStart, anStart, moisEnd, anEnd),
      lastCommodities: this.getLastCommodities(0, 50),
      inOutDeltas: this.getInOutDeltasInCurrency(moneyType),
    };

    return forkJoin(observables).pipe(
      switchMap((data) => {
        // Calculate income/expense counts from the monthly data
        const incomeCount = data.incomeMonthly?.resources?.length || 0;
        const expenseList = data.expenseAgents?.content || [];
        const expenseCount = expenseList.length;

        // Build debt summary
        const debtSummary = this.buildDebtSummary(data.inOutDeltas);

        // Build basic stats
        const stats = this.buildDashboardStats(
          data.infoAbout,
          data.incomeSum || 0,
          data.expensesSum || 0,
          debtSummary.sum,
          debtSummary.count,
          incomeCount,
          expenseCount
        );

        // Build monthly trends
        const trends = this.buildMonthlyTrends(data.incomeMonthly, data.expenseAgents);

        // Build commodity popularity
        const commodityPopularity = this.buildCommodityPopularity(data.lastCommodities);

        // Build currency exchange stats (try to get exchange data)
        const currencyExchangeStats: CurrencyExchangeStat[] = [];

        const exchangeObservable$ = this.getExchangeReport(moneyType, moneyType).pipe(
          switchMap((report) =>
            this.getAverageExchangeRate(moneyType, moneyType).pipe(
              switchMap((avgRate) => {
                currencyExchangeStats.push(
                  this.buildCurrencyExchangeStats(report, avgRate, moneyType.code, moneyType.code)
                );
                return of(null);
              })
            )
          ),
          catchError(() => of(null))
        );

        return forkJoin({
          stats: of(stats),
          trends: of(trends),
          commodityPopularity: of(commodityPopularity),
          debtSummary: of(debtSummary),
          infoAbout: of(data.infoAbout),
          exchange$: exchangeObservable$,
        }).pipe(
          switchMap((results) => {
            return of({
              stats: results.stats,
              trends: results.trends,
              commodityPopularity: results.commodityPopularity,
              debtSummary: results.debtSummary,
              currencyExchangeStats,
              infoAbout: results.infoAbout,
            });
          })
        );
      })
    );
  }
}
