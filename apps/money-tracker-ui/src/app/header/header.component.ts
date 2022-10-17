import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { NavigationEnd, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints, MediaMatcher } from '@angular/cdk/layout';
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  mobileQuery: MediaQueryList;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  private _mobileQueryListener: () => void;

  // the header of the application
  @Input() title: String = ''

  @Input() username: String = ''

  faLogout = faSignOut;

  // current route of the application
  currentRoute: String = '';

  constructor(private router: Router, private readonly keycloak: KeycloakService,
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

  ngOnInit(): void {}

  logout() {
    this.keycloak.logout('*').then()
  }

  userInfo() {
    return this.username
  }
}
