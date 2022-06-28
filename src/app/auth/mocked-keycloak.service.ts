import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class MockedKeycloakService extends KeycloakService {

  override init() {
    return Promise.resolve(true);
  }

  override isLoggedIn() {
    return Promise.resolve(true);
  }

  override getUserRoles(allRoles?: boolean) {
    return [];
  }

  override getUsername() {
    return 'Test User'
  }

  override getKeycloakInstance() {

    return {
      loadUserProfile: () => {
        Promise.resolve({}).then(r => 'test')
      },
      authenticated: true
    } as any;
  }
}
