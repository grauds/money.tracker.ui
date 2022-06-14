import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Commodity } from '../model/commodity';
import { environment } from '../../../environments/environment';
import { MoneyTypes } from '../model/money-types';

@Injectable({
  providedIn: 'root'
})
export class TotalsStatisticsService {

  constructor(private http: HttpClient) { }

  getTotalsForCommodity(commodityId: string | null,
                        moneyCode: MoneyTypes,
                        callback: (arg0: number) => void,
                        error: (arg0: Error) => void) {

    if (commodityId) {
      const observer = {
        next: (response: any) => {
          callback(response)
        }, error: (e: Error) => {
          error(e)
        }
      }
// todo id for an entity??
      this._queryTotalsForCommodity(commodityId, moneyCode.toString()).subscribe(observer)
    }
  }

  private _queryTotalsForCommodity(commodityId: string, moneyCode: string) {
    return this.http.get<number>(environment.apiUrl + '/expenseItems/search/sumCommodityExpenses', {
      params: {
        commodityId: commodityId,
        moneyCode: moneyCode
      }
    })
  }
}
