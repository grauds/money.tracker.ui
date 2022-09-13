import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment.local';

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
    return environment.keyCloakUser.username
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
