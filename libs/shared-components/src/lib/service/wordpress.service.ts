import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import {
  WordPressArticle,
  WordPressArticlePayload,
  WordPressMedia,
  WordPressTag,
} from '@clematis-shared/model';

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
  getArticlesByDay(date: string | Date): Observable<WordPressArticle[]> {
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

    return this.http.get<WordPressArticle[]>(this.getUrl('/wp/v2/posts'), {
      params,
    });
  }

  createArticle(
    payload: WordPressArticlePayload,
  ): Observable<WordPressArticle> {
    return this.http.post<WordPressArticle>(
      this.getUrl('/wp/v2/posts'),
      payload,
      { headers: this.getAuthHeaders() },
    );
  }

  updateArticle(
    id: number,
    payload: Partial<WordPressArticlePayload>,
  ): Observable<WordPressArticle> {
    return this.http.put<WordPressArticle>(
      this.getUrl(`/wp/v2/posts/${id}`),
      payload,
      { headers: this.getAuthHeaders() },
    );
  }

  getTags(): Observable<WordPressTag[]> {
    const params = new HttpParams().set('per_page', '100');
    return this.http.get<WordPressTag[]>(this.getUrl('/wp/v2/tags'), {
      params,
    });
  }

  createTag(name: string): Observable<WordPressTag> {
    return this.http.post<WordPressTag>(
      this.getUrl('/wp/v2/tags'),
      { name },
      { headers: this.getAuthHeaders() },
    );
  }

  uploadMedia(
    file: File,
    options?: { postId?: number | null; date?: string },
  ): Observable<WordPressMedia> {
    const day = (options?.date || new Date().toISOString())
      .split('T')
      .find(() => true);

    const targetFileName = this.buildDatedFileName(file.name, day);

    const formData = new FormData();
    formData.append('file', file, targetFileName);

    if (options?.postId) {
      formData.append('post', String(options.postId));
    }

    if (day) {
      formData.append('date', `${day}T12:00:00`);
    }

    return this.http.post<WordPressMedia>(
      this.getUrl('/wp/v2/media'),
      formData,
      { headers: this.getAuthHeaders() },
    );
  }

  private buildDatedFileName(originalName: string, day?: string): string {
    if (!day) {
      return originalName;
    }

    // don't change if already in format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}[-_]/.test(originalName)) {
      return originalName;
    }

    const lastDot = originalName.lastIndexOf('.');
    const ext =
      lastDot > 0 ? originalName.slice(lastDot).toLowerCase() : '.webp';
    const base = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;

    // sanitize
    const sanitizedBase = base
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9_-]/g, '');

    return `${day}-${sanitizedBase || 'photo'}${ext}`;
  }

  getUrl(path: string): string {
    const baseUrl = this.environmentService.getValue('wordpressUrl');
    // Prevents double-slashes if the baseUrl accidentally ends with one
    return `${baseUrl.replace(/\/$/, '')}${path}`;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.environmentService.getValue('wordpressAuthToken');
    return token
      ? new HttpHeaders({ Authorization: `Basic ${token}` })
      : new HttpHeaders();
  }
}
