import {Component, OnInit} from '@angular/core';
import {KeycloakEventType, KeycloakService} from 'keycloak-angular';
import {KeycloakProfile} from 'keycloak-js';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Money Tracker';

  isLoggedIn = false;

  userProfile: KeycloakProfile | null = null;

  constructor(protected readonly keycloak: KeycloakService,
               private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {

    // subscription to updates
    this.keycloak.keycloakEvents$.subscribe({
      next: async (e) => {
        if (e.type == KeycloakEventType.OnAuthSuccess) {
          this.isLoggedIn = true
          await this.keycloak.loadUserProfile().then(profile => {
            this.userProfile = profile
          });
          if (this.route.snapshot.queryParams['redirect']) {
            await this.router.navigate([this.route.snapshot.queryParams['redirect']]);
          }
        } else if (e.type == KeycloakEventType.OnAuthError
          || e.type == KeycloakEventType.OnAuthLogout) {
          this.isLoggedIn = false
          this.userProfile = null
          await this.keycloak.login()
        } else if (e.type === KeycloakEventType.OnReady && !this.isLoggedIn) {
          await this.keycloak.login()
        }
      }
    });
  }
}
