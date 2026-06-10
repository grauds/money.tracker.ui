import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AuthGuardData, createAuthGuard } from "keycloak-angular";
import Keycloak from 'keycloak-js';

const isAccessAllowed =  async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    authData: AuthGuardData
  ): Promise<boolean | UrlTree> => {
    const keycloak = inject(Keycloak);
    const { authenticated, grantedRoles } = authData;

    if (!authenticated) {
      await keycloak.login({
        redirectUri: `${window.location.origin}${state.url}`,
      });

      return false;
    }

    try {
      await keycloak.updateToken(30);
    } catch {
      return false;
    }

    // Get the roles required from the route.
    const requiredRole = route.data['role'];

    // Allow the user to proceed if no additional roles
    // are required to access the route.
    if (!requiredRole) {
      return authenticated;
    }

    const hasRequiredRole = (role: string): boolean =>
        Object.values(grantedRoles.resourceRoles).some((roles) =>
          roles.includes(role)
        );

    // Allow the user to proceed if all
    // the required roles are present.
    return authenticated && hasRequiredRole(requiredRole);
  }

export const canActivate = createAuthGuard<CanActivateFn>(isAccessAllowed);
