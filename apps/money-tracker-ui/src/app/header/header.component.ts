import { Component, Input, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { NavigationEnd, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  // the header of the application
  @Input() title: String = ''

  faLogout = faSignOut;

  // collapsed menu flag
  isCollapsed: boolean = true;

  // current route of the application
  currentRoute: String = '';

  constructor(private router: Router, private readonly keycloak: KeycloakService) {
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

  isLoggedIn() {
    return this.keycloak.getKeycloakInstance().authenticated
  }

  userInfo() {
    return this.keycloak.getUsername()
  }
}
