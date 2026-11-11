import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CommodityPopularity,
  CurrencyExchangeStat,
  InfoAbout,
  MonthlyTrend,
  OrganizationSpending,
} from '@clematis-shared/model';

import { EnvironmentService } from './environment.service';

@Injectable()
export class StatsService {
  environmentService: EnvironmentService;

  constructor(
    private readonly http: HttpClient,
    environmentService: EnvironmentService
  ) {
    this.environmentService = environmentService;
  }

  getInfoAbout(): Observable<InfoAbout> {
    return this.http.get<InfoAbout>(this.getUrl('/about'));
  }

  getMonthlyTrend(code: string): Observable<MonthlyTrend[]> {
    return this.http.get<MonthlyTrend[]>(this.getUrl('/stats/monthlyTrend'), {
      params: { code },
    });
  }

  getCommodityPopularity(code: string): Observable<CommodityPopularity[]> {
    return this.http.get<CommodityPopularity[]>(
      this.getUrl('/stats/commodityPopularity'),
      { params: { code } }
    );
  }

  getOrganizationSpending(code: string): Observable<OrganizationSpending[]> {
    return this.http.get<OrganizationSpending[]>(
      this.getUrl('/stats/organizationSpending'),
      { params: { code } }
    );
  }

  getCurrencyExchangeStats(code: string): Observable<CurrencyExchangeStat[]> {
    return this.http.get<CurrencyExchangeStat[]>(
      this.getUrl('/stats/currencyExchangeStat'),
      { params: { code } }
    );
  }

  getUrl(url: string): string {
    return this.environmentService.getValue('infoUrl') + url;
  }
}
