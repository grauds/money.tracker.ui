import { KeycloakService } from 'keycloak-angular';
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
        checkLoginIframe: true,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      },
      loadUserProfileAtStartUp: true,
      updateMinValidity: 90,
    });
  }
}
