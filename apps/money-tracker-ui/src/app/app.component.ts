import { Component, OnInit } from '@angular/core';
import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '@clematis-shared/model';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Money Tracker';

  isLoggedIn = false;

  userProfile: KeycloakProfile | null = null;

  loading = false;

  constructor(
    protected readonly keycloak: KeycloakService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    // subscription to updates
    this.keycloak.keycloakEvents$.subscribe({
      next: (e) => {
        if (e.type == KeycloakEventType.OnAuthSuccess) {
          this.isLoggedIn = true;
          this.keycloak.loadUserProfile().then((profile) => {
            this.userProfile = profile;
          });
          if (this.route.snapshot.queryParams['redirect']) {
            const params: HttpParams = Utils.moveQueryParametersFromRedirectUrl(
              this.route.snapshot.queryParams
            );
            this.router.navigate([params.get('redirect')], {
              queryParams: Utils.parseRedirectParameters(params),
            });
          }
        } else if (
          e.type == KeycloakEventType.OnAuthError ||
          e.type == KeycloakEventType.OnAuthLogout
        ) {
          this.isLoggedIn = false;
          this.userProfile = null;
          this.keycloak.login();
        } else if (e.type === KeycloakEventType.OnReady && !this.isLoggedIn) {
          this.keycloak.login();
        }
      },
    });
  }
}
