import { Component, effect, inject } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '@clematis-shared/model';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from "@angular/common";

import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEvent,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs
} from "keycloak-angular";
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { AppModule } from "./app.module";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  standalone: true,
  imports: [
    CommonModule,
    AppModule
  ]
})
export class AppComponent {

  title = 'Money Tracker';
  isLoggedIn = false;
  userProfile: KeycloakProfile | undefined = undefined;
  loading = false;
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  constructor(
    protected readonly keycloak: Keycloak,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {

    // subscription to updates
    effect(() => {

        const keycloakEvent: KeycloakEvent = this.keycloakSignal();

        this.isLoggedIn = typeEventArgs<ReadyArgs>(keycloakEvent.args);
        this.keycloak.loadUserProfile().then((profile) => {
          this.userProfile = profile;
        }).catch((error) => {
          this.userProfile = undefined;
          this.keycloak.login();
        });

        console.log(keycloakEvent);

        if (keycloakEvent.type == KeycloakEventType.AuthSuccess) {

          if (this.route.snapshot.queryParams['redirect']) {
            const params: HttpParams = Utils.moveQueryParametersFromRedirectUrl(
              this.route.snapshot.queryParams
            );
            this.router.navigate([params.get('redirect')], {
              queryParams: Utils.parseRedirectParameters(params),
            });
          }

        } else if (
             keycloakEvent.type == KeycloakEventType.AuthError
              ||
             keycloakEvent.type == KeycloakEventType.AuthLogout
              ||
             keycloakEvent.type == KeycloakEventType.TokenExpired
        ) {

          this.userProfile = undefined;
          this.keycloak.logout();

        }
      }
    )
  }
}
