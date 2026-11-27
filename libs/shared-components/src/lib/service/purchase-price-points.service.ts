import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EnvironmentService } from './environment.service';
import { PurchasePricePoint } from '@clematis-shared/model';

@Injectable()
export class PurchasePricePointsService {
  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
  ) {}

  getByCommodity(commodityId: string | null): Observable<PurchasePricePoint[]> {
    if (commodityId) {
      return this.http.get<PurchasePricePoint[]>(
        this.environmentService.getValue('apiUrl') + `/commodities/${commodityId}/purchasePricePoints`
      );
    }
    return new Observable<PurchasePricePoint[]>(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}
