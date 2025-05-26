import Keycloak from "keycloak-js";
import { signal } from "@angular/core";
import { KeycloakEventType } from "keycloak-angular";

export class MockKeycloak implements Partial<Keycloak> {
  authenticated?: boolean | undefined = true;
  token?: string = "mock-token";

  async init(): Promise<boolean> {
    return true;
  }

  async updateToken(): Promise<boolean> {
    return true;
  }

  async login(): Promise<void> {
    this.authenticated = true;
  }

  async logout(): Promise<void> {
    this.authenticated = false;
  }

  hasRealmRole(): boolean {
    return true;
  }

  hasResourceRole(): boolean {
    return true;
  }

  loadUserProfile(): Promise<Keycloak.KeycloakProfile> {
    return Promise.resolve({
      id: "mock-id",
      username: "mock-user",
      email: "mock@example.com",
      firstName: "Mock",
      lastName: "User"
    });
  }
}

export const mockEventSignal = signal<KeycloakEventType | null>(null);
