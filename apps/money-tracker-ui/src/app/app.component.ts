import { Component, OnInit } from '@angular/core';
import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Money Tracker';

  isLoggedIn = false;

  userProfile: KeycloakProfile | null = null;

  constructor( protected readonly keycloak: KeycloakService ) {}

  public async ngOnInit() {

    // initialization of a component status
    this.keycloak.isLoggedIn().then((logged) => {
      this.isLoggedIn = logged
      if (logged) {
        this.keycloak.loadUserProfile().then(profile => {
          this.userProfile = profile
        });
      }
    })

    // subscription to other updates
    this.keycloak.keycloakEvents$.subscribe({
      next: (e) => {
        if (e.type == KeycloakEventType.OnAuthSuccess) {
          this.isLoggedIn = true
          this.keycloak.loadUserProfile().then(profile => {
            this.userProfile = profile
          });
        } else if (e.type == KeycloakEventType.OnAuthError
          || e.type == KeycloakEventType.OnAuthLogout) {
          this.isLoggedIn = false
          this.userProfile = null
        }
      }
    });
  }
}
