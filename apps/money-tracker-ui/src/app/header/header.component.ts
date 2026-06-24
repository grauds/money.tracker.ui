import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  inject,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MoneySelectorComponent } from './money-selector/money-selector.component';
import { WorkspaceComponent } from '../workspace/workspace.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    MoneySelectorComponent,
    WorkspaceComponent,
  ],
})
export class HeaderComponent {
  // the header of the application
  @Input() title = '';

  @Input() userProfile?: KeycloakProfile;

  @Input() isLoggedIn?: boolean;

  public isCollapsed = true;
  private cdr = inject(ChangeDetectorRef);

  // current route of the application
  currentRoute = '';

  constructor(
    private readonly router: Router,
    private readonly keycloak: Keycloak,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide the progress spinner or progress bar
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }

  public setCollapse(value: boolean): void {
    this.isCollapsed = value;
    this.cdr.detectChanges();
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
