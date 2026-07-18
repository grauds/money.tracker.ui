import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { ImmichAsset, ImmichRandomSearchPayload } from './immich.models';

@Injectable()
export class ImmichService {

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);

  private readonly API_KEY = 'kNTwUx5uYGpFXc9IofjEHoLpFIydom6KQz0ugaOHilI';

  /**
   * Get random photos for a specified date
   * @param date format YYYY-MM-DD (e.g., 2026-07-13)
   * @param qty total count of items to fetch
   */
  getRandomPhotos(date: string, qty = 10): Observable<ImmichAsset[]> {
    const headers = new HttpHeaders({ 'x-api-key': this.API_KEY });

    const body: ImmichRandomSearchPayload = {
      type: 'IMAGE',
      takenAfter: `${date}T00:00:00.000Z`,
      takenBefore: `${date}T23:59:59.999Z`,
      isVisible: true,
      size: qty,
    };

    return this.http.post<ImmichAsset[]>(this.getUrl('/search/random'), body, {
      headers,
    });
  }

  /**
   * Fetch the thumbnail binary file and transform it into an Object URL
   * @param assetId UUID of targeted asset
   */
  getThumbnailUrl(assetId: string): Observable<string> {
    const headers = new HttpHeaders({ 'x-api-key': this.API_KEY });

    return this.http
      .get(this.getUrl(`/assets/${assetId}/thumbnail?size=preview`), {
        headers,
        responseType: 'blob',
      })
      .pipe(map((blob: Blob) => URL.createObjectURL(blob)));
  }

  getUrl(url: string): string {
    return this.environmentService.getValue('immichUrl') + url;
  }
}
