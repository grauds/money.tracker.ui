import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { EnvironmentService } from "@clematis-shared/shared-components";

export function initializeKeycloak(
  keycloak: KeycloakService,
  environment: EnvironmentService
) {
  return () => {
    keycloak.init({
      config: {
        url: environment.getValue('authUrl'),
        realm: 'clematis',
        clientId: 'clematis-money-tracker-ui'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        checkLoginIframe: false
      },
      bearerExcludedUrls: ['/assets', '/clients/public'],
      shouldUpdateToken: (request) => {
        return !!request.headers.get('token-update');
      },
      loadUserProfileAtStartUp: true,
      updateMinValidity: 20,
    });
    keycloak.keycloakEvents$.subscribe({
      next: (e) => {
        if (e.type == KeycloakEventType.OnTokenExpired) {
          keycloak.updateToken(20);
        }
      }
    });
  }
}
