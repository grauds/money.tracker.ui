import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { InfoAbout } from '@clematis-shared/model';

import { EnvironmentService } from './environment.service';

@Injectable()
export class StatsService {
  environmentService: EnvironmentService;

  constructor(
    private http: HttpClient,
    environmentService: EnvironmentService
  ) {
    this.environmentService = environmentService;
  }

  getIncomeTransactionsCount(): Observable<InfoAbout> {
      return this.http.get<InfoAbout>(
        this.getUrl('/about')
      );
  }

  getUrl(url: string) :string {
    return this.environmentService.getValue('aboutUrl') + url
  }
}
