import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { NavigationEnd, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints, MediaMatcher } from '@angular/cdk/layout';
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import {KeycloakProfile} from "keycloak-js";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  mobileQuery: MediaQueryList;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  private readonly _mobileQueryListener: () => void;

  // the header of the application
  @Input() title: string = ''

  @Input() userProfile?: KeycloakProfile

  @Input() isLoggedIn?: boolean;

  // current route of the application
  currentRoute: String = '';

  constructor(private router: Router,
              private readonly keycloak: KeycloakService,
              changeDetectorRef: ChangeDetectorRef,
              media: MediaMatcher,
              private breakpointObserver: BreakpointObserver) {

    this.mobileQuery = media.matchMedia('(max-width: 800px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener("change", this._mobileQueryListener);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide progress spinner or progress bar
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
      return this.userProfile.firstName
        + ' ' + this.userProfile.lastName
        + ' (' + this.userProfile.username + ')'
    } else {
      return ''
    }

  }
}
