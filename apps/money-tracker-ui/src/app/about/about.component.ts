import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { InfoAbout } from '@clematis-shared/model';
import { StatsService } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass'],
})
export class AboutComponent implements OnInit {


  income: number = 0;

  infoAbout: InfoAbout | undefined;

  constructor(private title: Title, private statsService: StatsService) {}

  ngOnInit(): void {
    this.title.setTitle('Money Tracker - About');
    this.loadData();
  }
  loadData() {
    this.statsService.getIncomeTransactionsCount().subscribe(infoAbout => {
      this.infoAbout = infoAbout;
    });
  }
  getStartDate() {
    if (this.infoAbout && this.infoAbout.dates && this.infoAbout.dates.start) {
      return formatDate(this.infoAbout.dates.start, 'mediumDate', 'en_US'); 
    } else {
      return "No date"
    }
  }

  getLastDate() {
    if (this.infoAbout && this.infoAbout.dates && this.infoAbout.dates.end) {
      return formatDate(this.infoAbout.dates.end, 'mediumDate', 'en_US'); 
    } else {
      return "No date"
    }
  }
}
