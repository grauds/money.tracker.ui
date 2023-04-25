import { Component } from '@angular/core';
import { KeycloakService } from "keycloak-angular";

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.sass'],
})
export class WorkspaceComponent {

  constructor(protected readonly keycloak: KeycloakService) {}
}
