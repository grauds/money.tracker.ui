import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AuthGuardData, createAuthGuard } from "keycloak-angular";

const isAccessAllowed =  async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    authData: AuthGuardData
  ): Promise<boolean | UrlTree> => {

    const { authenticated, grantedRoles } = authData;

    // Get the roles required from the route.
    const requiredRole = route.data['role'];

    // Allow the user to proceed if no additional roles
    // are required to access the route.
    if (!requiredRole) {
      return authenticated;
    }

    const hasRequiredRole = (role: string): boolean =>
        Object.values(grantedRoles.resourceRoles).some((roles) => roles.includes(role));

    // Allow the user to proceed if all
    // the required roles are present.
    return authenticated && hasRequiredRole(requiredRole);
  }

export const canActivate = createAuthGuard<CanActivateFn>(isAccessAllowed);
