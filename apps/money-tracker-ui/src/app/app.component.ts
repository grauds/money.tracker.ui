import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'Money Tracker';

  username = ''

  constructor(
    protected readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {

    const username$ = new Observable<string>((subscriber => {
      try {
        subscriber.next(this.keycloak.getUsername())
      } catch (e) {
        subscriber.error(e)
      }
    }));

    username$.subscribe(value => {
      this.username = value
    }, error => {
      this.username = 'Not logged in'
    })

    keycloak.keycloakEvents$.subscribe({
      next: (e) => {
        if (e.type == KeycloakEventType.OnTokenExpired) {
          keycloak.updateToken(20);
        }
      }
    });
  }
}
