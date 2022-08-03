import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HateoasResourceService, ResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { environment } from '../../../environments/environment';
import { MoneyTypes } from '../model/money-types';
import { ExpenseItem } from '../model/expense-item';
import { AccountBalance } from '../model/account-balance';
import { PagedResourceCollection } from '@lagoshny/ngx-hateoas-client/lib/model/resource/paged-resource-collection';

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
      this._doQuery('/expenseItems/search/sumCommodityExpenses', {
        params: {
          commodityId: commodityId,
          moneyCode: moneyCode
        }
      }).subscribe(observer)
    }
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
      this._doQuery('/expenses/search/sumCommodityGroupExpenses', {
        params: {
          commodityGroupId: commodityGroupId,
          moneyCode: moneyCode
        }
      }).subscribe(observer)
    }
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
      this._doQuery('/expenseItems/search/sumCommodityQuantity', {
        params: {
          commodityId: commodityId
        }
      }).subscribe(observer)
    }
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
      this.resourceService.searchCollection(ExpenseItem, 'findByCommodityId', {
        params: {
          commodityId: commodityId
        }
      }).subscribe(observer)
    }
  }

  getAccountsBalance(callback: (arg0: PagedResourceCollection<AccountBalance>) => void,
                     error: (arg0: Error) => void) {
    const observer = {
      next: (response: PagedResourceCollection<AccountBalance>) => {
        callback(response)
      }, error: (e: Error) => {
        error(e)
      }
    }
    this.resourceService.getPage<AccountBalance>(AccountBalance, {pageParams: {
        size: 100
      }}).subscribe(observer)
  }

  private _doQuery(url: string, options: any) {
    return this.http.get<number>(environment.apiUrl + url, options)
  }
}
