import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {KeycloakAuthGuard, KeycloakService} from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {

  constructor(
    protected override router: Router,
    protected override keycloakAngular: KeycloakService
  ) {
    super(router, keycloakAngular);
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {

    if (!this.authenticated) {
      await this.keycloakAngular.login({
        redirectUri: window.location.origin + '/about',
      });
    }
    return this.authenticated
  }

}
