import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HateoasResourceService, ResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { environment } from '../../../environments/environment';
import { MoneyTypes } from '../model/money-types';
import { ExpenseItem } from '../model/expense-item';

@Injectable({
  providedIn: 'root'
})
export class TotalsStatisticsService {

  constructor(private http: HttpClient, private resourceService: HateoasResourceService) { }

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

  getTotalsForCommodityGroup(commodityGroupId: string | null,
                        moneyCode: MoneyTypes,
                        callback: (arg0: number) => void,
                        error: (arg0: Error) => void) {

    if (commodityGroupId) {
      const observer = {
        next: (response: any) => {
          callback(response)
        }, error: (e: Error) => {
          error(e)
        }
      }
      this._queryTotalsForCommodityGroup(commodityGroupId, moneyCode.toString()).subscribe(observer)
    }
  }

  private _queryTotalsForCommodityGroup(commodityGroupId: string, moneyCode: string) {
    return this.http.get<number>(environment.apiUrl + '/expenses/search/sumCommodityGroupExpenses', {
      params: {
        commodityGroupId: commodityGroupId,
        moneyCode: moneyCode
      }
    })
  }

  getTotalQtyForCommodity(commodityId: string | null,
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
      this._queryTotalQtyForCommodity(commodityId).subscribe(observer)
    }
  }

  private _queryTotalQtyForCommodity(commodityId: string) {
    return this.http.get<number>(environment.apiUrl + '/expenseItems/search/sumCommodityQuantity', {
      params: {
        commodityId: commodityId
      }
    })
  }

  getCommodityExpences(commodityId: string | null,
                          callback: (arg0: ResourceCollection<ExpenseItem>) => void,
                          error: (arg0: Error) => void) {

    if (commodityId) {
      const observer = {
        next: (response: any) => {
          callback(response)
        }, error: (e: Error) => {
          error(e)
        }
      }
      this._getCommodityExpences(commodityId).subscribe(observer)
    }
  }

  private _getCommodityExpences(commodityId: string) {
    return this.resourceService.searchCollection(ExpenseItem, 'findByCommodityId', {
      params: {
        commodityId: commodityId
      }
    })
  }
}
