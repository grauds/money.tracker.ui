import { Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import Keycloak, { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
  standalone: false,
})
export class HeaderComponent {
  isFullLayout$: Observable<boolean> = this.breakpointObserver
    .observe([
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
      Breakpoints.TabletLandscape,
      Breakpoints.WebLandscape,
    ])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  // the header of the application
  @Input() title = '';

  @Input() userProfile?: KeycloakProfile;

  @Input() isLoggedIn?: boolean;

  // current route of the application
  currentRoute = '';

  constructor(
    private readonly router: Router,
    private readonly keycloak: Keycloak,
    private readonly breakpointObserver: BreakpointObserver
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide the progress spinner or progress bar
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }

  public login() {
    this.keycloak.login();
  }

  public logout() {
    this.keycloak.logout();
  }

  getUserInfo() {
    if (this.userProfile) {
      return (
        this.userProfile.firstName +
        ' ' +
        this.userProfile.lastName +
        ' (' +
        this.userProfile.username +
        ')'
      );
    } else {
      return '';
    }
  }
}
