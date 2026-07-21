import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';

@Injectable()
export class WordpressService {
  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
  ) {}

  /**
   * Fetches articles published on a specific day.
   * @param date ISO string or Date object (e.g., '2026-07-21' or new Date())
   */
  getArticlesByDay(date: string | Date): Observable<any[]> {
    // Create fresh date instances to prevent reference mutation issues
    const baseDateStart =
      typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    const baseDateEnd =
      typeof date === 'string' ? new Date(date) : new Date(date.getTime());

    // Create correct start and end ISO bounds
    const startOfDay = new Date(
      baseDateStart.setHours(0, 0, 0, 0),
    ).toISOString();
    const endOfDay = new Date(
      baseDateEnd.setHours(23, 59, 59, 999),
    ).toISOString();

    // Set WordPress API query parameters
    const params = new HttpParams()
      .set('after', startOfDay)
      .set('before', endOfDay)
      .set('_embed', 'true'); // Includes featured images and author data

    // Fixed path: Changed from '/' to '/wp/v2/posts'
    return this.http.get<any[]>(this.getUrl('/wp/v2/posts'), { params });
  }

  getUrl(path: string): string {
    const baseUrl = this.environmentService.getValue('wordpressUrl');
    // Prevents double-slashes if the baseUrl accidentally ends with one
    return `${baseUrl.replace(/\/$/, '')}${path}`;
  }
}
