import { formatDate } from '@angular/common';
import { Component, effect, inject, OnInit } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { InfoAbout } from '@clematis-shared/model';
import { StatsService } from '@clematis-shared/shared-components';

import Keycloak from "keycloak-js";
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs
} from "keycloak-angular";

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass'],
  standalone: false,
})
export class AboutComponent implements OnInit {

  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  isLoggedIn = false;
  income = 0;
  infoAbout: InfoAbout | undefined;

  constructor(
    protected readonly keycloak: Keycloak,
    private readonly title: Title,
    private readonly statsService: StatsService
  ) {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();

      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.isLoggedIn = typeEventArgs<ReadyArgs>(keycloakEvent.args);
      }

      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.isLoggedIn = false;
      }
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Money Tracker - About');
    this.loadData();
  }

  loadData() {
    this.statsService.getIncomeTransactionsCount().subscribe((infoAbout) => {
      this.infoAbout = infoAbout;
    });
  }

  getStartDate() {
    if (this.infoAbout && this.infoAbout.dates && this.infoAbout.dates.start) {
      return formatDate(this.infoAbout.dates.start, 'mediumDate', 'en_US');
    } else {
      return 'No date';
    }
  }

  getLastDate() {
    if (this.infoAbout && this.infoAbout.dates && this.infoAbout.dates.end) {
      return formatDate(this.infoAbout.dates.end, 'mediumDate', 'en_US');
    } else {
      return 'No date';
    }
  }
}
