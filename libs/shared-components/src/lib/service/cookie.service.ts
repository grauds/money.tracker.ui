import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly keycloak = inject(Keycloak);

  /**
   * Retrieves the unique Keycloak user identifier (subject claim)
   * Falls back to 'anonymous' if token session context is missing
   */
  private getUserIdPrefix(): string {
    try {
      const profile = this.keycloak.idTokenParsed;
      return profile?.sub ? `usr_${profile.sub}_` : 'usr_anonymous_';
    } catch {
      return 'usr_anonymous_';
    }
  }

  /**
   * Saves an encoded object state into browser storage targeted
   * to the active user profile
   */
  public setState(key: string, value: unknown): void {
    const userSpecificKey = `${this.getUserIdPrefix()}${key}`;
    const serializedData = encodeURIComponent(JSON.stringify(value));

    // Configured for modern security criteria
    document.cookie = `${userSpecificKey}=${serializedData}; path=/; SameSite=Strict; Secure`;
  }

  /**
   * Extracts and parses the specific user state safely
   */
  public getState<T>(key: string): T | null {
    const userSpecificKey = `${this.getUserIdPrefix()}${key}`;
    const match
      = document.cookie.match(new RegExp('(^| )' + userSpecificKey + '=([^;]+)'));

    if (!match) return null;

    try {
      return JSON.parse(decodeURIComponent(match[2])) as T;
    } catch (e) {
      console.error(`Failed parsing user-isolated cookie state for key: ${key}`, e);
      return null;
    }
  }
}
