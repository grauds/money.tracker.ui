import { Component } from '@angular/core';
import { KeycloakService } from "keycloak-angular";
import {
  ActivatedRoute,
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router
} from "@angular/router";

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.sass'],
})
export class WorkspaceComponent {

  loading: boolean = false;

  constructor(protected readonly keycloak: KeycloakService,
              private router: Router,
              private route: ActivatedRoute) {

    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          break;
        }
        default: {
          break;
        }
      }
    });
  }
}
