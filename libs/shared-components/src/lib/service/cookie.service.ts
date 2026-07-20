import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
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
      console.log('profile', profile);
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

    console.log(
      'EntityList LocalStorage Persistence: Writing state configuration payload:',
      userSpecificKey,
    );

    // Write to client-side localStorage instead of cookies
    localStorage.setItem(userSpecificKey, serializedData);
  }

  /**
   * Extracts and parses the specific user state safely
   */
  public getState<T>(key: string): T | null {
    const userSpecificKey = `${this.getUserIdPrefix()}${key}`;

    // Retrieve value directly from localStorage
    const storedValue = localStorage.getItem(userSpecificKey);

    if (!storedValue) {
      console.log('No match found', userSpecificKey);
      return null;
    }

    console.log('Match found', userSpecificKey);

    try {
      return JSON.parse(decodeURIComponent(storedValue)) as T;
    } catch (e) {
      console.error(
        `Failed parsing user-isolated client state for key: ${key}`,
        e,
      );
      return null;
    }
  }
}
