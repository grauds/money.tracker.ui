import { MoneyType } from '@clematis-shared/model';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DayService {
  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
  ) {}

  getIncomeSumByDay(day: string, moneyCode: MoneyType): Observable<number> {
    if (day) {
      return this.http.get<number>(
        this.getUrl(`/incomeItems/search/sumDailyIncome`),
        {
          params: {
            targetDate: day,
            moneyCode: moneyCode.code,
          },
        },
      );
    }
    return of(0);
  }

  getExpensesSumByDay(day: string, moneyCode: MoneyType): Observable<number> {
    if (day) {
      return this.http.get<number>(
        this.getUrl(`/expenseItems/search/sumDailyExpenses`),
        {
          params: {
            targetDate: day,
            moneyCode: moneyCode.code,
          },
        },
      );
    }
    return of(0);
  }

  getUrl(url: string): string {
    return this.environmentService.getValue('apiUrl') + url;
  }
}
