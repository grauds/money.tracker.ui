import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment';

export function initializeKeycloak(
  keycloak: KeycloakService
) {
  return () => {
    keycloak.init({
      config: {
        url: environment.authUrl,
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
