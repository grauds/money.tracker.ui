import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HateoasResourceService, ResourceCollection } from '@lagoshny/ngx-hateoas-client';
import {
  AccountBalance,
  CommodityGroup,
  ExpenseItem,
  MoneyTypes,
  OrganizationGroup
} from '@clematis-shared/model';
import { PagedResourceCollection } from '@lagoshny/ngx-hateoas-client/lib/model/resource/paged-resource-collection';

// todo
import {environment} from "../../../../apps/money-tracker-ui/src/environments/environment";


@Injectable()
export class MoneyTrackerService {

  constructor(private http: HttpClient, private resourceService: HateoasResourceService) { }

  getPathForCommodityGroup(commodityGroupId: string | null): Observable<ResourceCollection<CommodityGroup>> {
    if (commodityGroupId) {
      return this.resourceService.searchCollection(CommodityGroup, 'pathById', {
        params: {
          id: commodityGroupId
        }
      })
    }
    return of(new ResourceCollection<CommodityGroup>())
  }

  getPathForOrganizationGroup(organizationGroupId: string | null): Observable<ResourceCollection<OrganizationGroup>> {

    if (organizationGroupId) {
      return this.resourceService.searchCollection(OrganizationGroup, 'pathById', {
        params: {
          id: organizationGroupId
        }
      })
    }
    return of(new ResourceCollection<OrganizationGroup>())
  }

  getTotalsForCommodity(commodityId: string | null,
                        moneyCode: MoneyTypes) {

    if (commodityId) {
      this.http.get<number>(this.getUrl('/expenseItems/search/sumCommodityExpenses'), {
        params: {
          commodityId: commodityId,
          moneyCode: moneyCode
        }
      })
    } return of(0)
  }

  getTotalsForCommodityGroup(commodityGroupId: string | null,
                             moneyCode: MoneyTypes): Observable<number> {

    if (commodityGroupId) {
      return this.http.get<number>(this.getUrl('/expenses/search/sumCommodityGroupExpenses'), {
        params: {
          commodityGroupId: commodityGroupId,
          moneyCode: moneyCode
        }
      })
    } return of(0)
  }

  getTotalQtyForCommodity(commodityId: string | null): Observable<number>  {

    if (commodityId) {
      return this.http.get<number>(this.getUrl('/expenseItems/search/sumCommodityQuantity'), {
        params: {
          commodityId: commodityId
        }
      })
    } return of(0)
  }


  getTotalsForOrganization(organizationId: string | null,
                           moneyCode: MoneyTypes): Observable<number> {
    if (organizationId) {
      return this.http.get<number>(this.getUrl('/expenseItems/search/sumOrganizationExpenses'), {
        params: {
          organizationId: organizationId,
          moneyCode: moneyCode
        }
      }).pipe(
        map(this.getResult.bind(this)),
        catchError(() => of(0))
      )
    } return of(0)
  }

  getCommodityExpences(commodityId: string | null): Observable<ResourceCollection<ExpenseItem>> {

    if (commodityId) {
      return this.resourceService.searchCollection(ExpenseItem, 'findByCommodityId', {
        params: {
          commodityId: commodityId
        }
      })
    } return of(new ResourceCollection<ExpenseItem>())
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

  getBalance(an: number, mois: number, code: string): Observable<number> {

      return this.http.get<number>(this.getUrl('/monthlyDeltas/search/balance'), {
        params: {
          an: an,
          mois: mois,
          code: code
        }
      }).pipe(
        map(this.getResult.bind(this)),
        catchError(() => of(0))
      )

  }

  getAverageExchangeRate(source: string, dest: string): Observable<number> {

    return this.http.get<number>(this.getUrl('/exchange/search/average'), {
      params: {
        source: source,
        dest: dest
      }
    }).pipe(
      map(this.getResult.bind(this)),
      catchError(() => of(0))
    )

  }


  private getResult(resp: number): number {
    return resp
  }

  private getUrl(url: string) :string {
    return environment.apiUrl + url
  }

  private _doQuery(url: string, options: any) {
    return this.http.get<number>(environment.apiUrl + url, options)
  }

}
