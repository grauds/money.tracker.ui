import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { InfoAbout } from '@clematis-shared/model';
import { StatsService } from '@clematis-shared/shared-components';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass'],
})
export class AboutComponent implements OnInit {
  isLoggedIn = false;

  income = 0;

  infoAbout: InfoAbout | undefined;

  constructor(
    protected readonly keycloak: KeycloakService,
    private readonly title: Title,
    private readonly statsService: StatsService
  ) {
    this.isLoggedIn = this.keycloak.isLoggedIn();
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
